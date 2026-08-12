# Sprint 3 — Governança de dados: purga automática e verificação de eliminação

**Data:** 2026-08-11
**Escopo:** estritamente governança de dados (§4.10) — rotina automática de purga, verificação de
integridade pós-purga e fechamento da lacuna de exportação não controlada.
**Deliberadamente NÃO implementado:** formulação textual, ajuda contextual e demais itens do
backlog U2.

Fecha os itens U1 nº 3 e nº 4 da lista pré-registro do relatório de auditoria
([AUDITORIA_METODOLOGIA.md](AUDITORIA_METODOLOGIA.md), Seção 11).

**Pré-requisitos verificados antes de iniciar:** Sprint 1 presente (`shared/eemm-types.ts` com os 3
níveis corretos e `VALENCES`; `server/src/database.ts` com coluna `valence` e
`UNIQUE(patient_id, dimension, level, valence)`) e Sprint 2 presente (`artifacts/` contém apenas
`mockup-sandbox`; `git ls-files | grep sqlite` vazio; `.gitignore` cobrindo `*.sqlite*`). O Sprint 2
estava aplicado mas não commitado — foi commitado (`7e2454b`) antes de iniciar este sprint, mantendo
um commit por sprint.

---

## 1. Decisão de design (Passo 1)

### 1.1 Ressalva de método

O documento do TCC **não está no repositório**. Não foi possível ler o Apêndice C completo, o
Apêndice B ou o §4.8.3 — apenas os trechos citados no enunciado do sprint. A avaliação de "existe
motivo técnico forte para preferir a Opção B" foi feita, portanto, sobre o roteiro T1–T8 tal como
resumido na auditoria, não sobre o texto integral. **Se o Apêndice C real contiver um passo
explícito de encerramento de sessão, esta decisão deve ser reavaliada.**

### 1.2 Opção escolhida: OPÇÃO A (TTL por tempo desde a criação)

O problema de fundo, que o próprio enunciado identifica: **o artefato não tem conceito de sessão.**
Não há autenticação, login/logout, cookie de sessão nem qualquer evento que marque início e fim de
uso. Qualquer implementação de "purga ao término da sessão" precisa, necessariamente, adotar um
proxy operacional — e esse proxy precisa estar declarado, não implícito.

Adotada a **Opção A**: expiração por tempo decorrido desde a criação do caso.

**Justificativa:**

1. **Não depende de cooperação do avaliador.** A Opção B (endpoint explícito de fim de sessão)
   only elimina o dado se alguém efetivamente disparar o encerramento. Se o avaliador fechar o
   navegador, perder conexão ou simplesmente pular o último passo do roteiro, o caso permanece no
   banco indefinidamente — e a garantia do §4.10 vira condicional ao comportamento humano, que é
   exatamente o que uma "rotina programática" deveria eliminar.
2. **Produz um teto de retenção garantido.** Com TTL, existe um intervalo máximo após o qual
   nenhum dado sobrevive, independentemente do que tenha acontecido na sessão. Isso é uma
   afirmação mais forte, e mais fácil de defender, do que "o dado é apagado quando alguém encerra".
3. **É compatível com o contexto de uso descrito.** Sessão única de 60–90 min (Apêndice B) mais a
   consolidação subsequente (§4.8.3) cabem folgadamente na janela adotada.
4. A Opção B não foi implementada — conforme instruído, apenas uma das duas.

**Contrapartida honesta, que precisa constar no texto:** um TTL contado da *criação* é um teto de
retenção, não um timeout de inatividade. Se uma sessão de uso ultrapassar o TTL, o caso é eliminado
**durante** o trabalho, não depois dele. Com TTL de 4 horas e sessões de 60–90 minutos a margem é
grande, mas o comportamento é esse e não deve ser descrito como se fosse detecção de fim de uso.

### 1.3 Mecanismo de disparo: `setInterval`, não middleware por request

Preferido `setInterval` conforme sugerido, por três razões que valem registro:

- O comportamento **não depende de haver tráfego**. Um caso expirado num servidor ocioso continua
  sendo eliminado; com middleware por request, o dado sobreviveria indefinidamente enquanto ninguém
  acessasse o sistema — o pior cenário possível para a afirmação do §4.10.
- Não adiciona latência a nenhuma chamada da API.
- É mais simples de raciocinar e de testar.

Acrescentada uma **passagem imediata no bootstrap** (além do intervalo), para cobrir o caso de o
servidor ter ficado fora do ar durante a janela de expiração. O timer usa `unref()`, para não
manter o processo vivo sozinho.

### 1.4 Valor do TTL

| Parâmetro | Valor de produção | Constante |
|---|---|---|
| Janela de retenção | **4 horas** (14.400 s) | `CASE_TTL_SECONDS` |
| Intervalo de varredura | **15 minutos** (900 s) | `PURGE_INTERVAL_SECONDS` |

Compatibilidade com o contexto declarado: a sessão de inspeção é única, de 60–90 minutos
(Apêndice B). 4 horas deixa margem de ~2,5× sobre o limite superior, cobrindo a sessão de
consolidação subsequente (§4.8.3) e eventuais interrupções, sem que a janela se torne retenção de
fato. Nenhum caso sobrevive a um turno de trabalho.

Ambos são sobrescrevíveis por variável de ambiente (`CASE_TTL_SECONDS`, `PURGE_INTERVAL_SECONDS`).
Isso existe para permitir **testar o mecanismo com janela curta sem editar código** — o que elimina
o risco de um valor de teste ficar commitado por engano. O valor de produção é o default no código.

---

## 2. Verificação pós-purga (Passo 3) — trecho citável no TCC

Núcleo do sprint. Esta é a função que dá correspondência material à afirmação do §4.10, em
[server/src/services/purge.ts](server/src/services/purge.ts):

```ts
export function deleteCaseAndVerify(patientId: number): PurgeVerification {
  const cellsBefore = db
    .prepare("SELECT COUNT(*) AS count FROM eemm_cells WHERE patient_id = ?")
    .get(patientId) as { count: number };

  db.prepare("DELETE FROM patients WHERE id = ?").run(patientId);

  // --- Verificação pós-purga ---
  const patientRows = db
    .prepare("SELECT COUNT(*) AS count FROM patients WHERE id = ?")
    .get(patientId) as { count: number };

  const cellRows = db
    .prepare("SELECT COUNT(*) AS count FROM eemm_cells WHERE patient_id = ?")
    .get(patientId) as { count: number };

  const verification: PurgeVerification = {
    patientId,
    patientRowsRemaining: patientRows.count,
    cellRowsRemaining: cellRows.count,
    verified: patientRows.count === 0 && cellRows.count === 0,
  };

  if (verification.verified) {
    console.log(
      `[purga] caso id=${patientId} eliminado e verificado: ` +
        `patients=0, eemm_cells=0 (${cellsBefore.count} celula(s) removida(s) em cascata)`
    );
  } else {
    console.error(
      `[purga][FALHA DE INTEGRIDADE] caso id=${patientId} NAO foi integralmente eliminado: ` +
        `patients=${verification.patientRowsRemaining}, ` +
        `eemm_cells=${verification.cellRowsRemaining}`
    );
  }

  return verification;
}
```

Três propriedades deliberadas:

1. **A verificação roda após o DELETE ter sido efetivado**, não dentro da mesma transação.
   `better-sqlite3` é síncrono e cada statement é autocommitado, então as duas consultas leem
   estado já committado. Essa é a leitura forte de "verificada por consulta ao banco imediatamente
   após a execução".
2. **Não confia no `ON DELETE CASCADE`.** O schema já declara a constraint desde o Sprint 1; a
   verificação existe justamente para comprovar o efeito em vez de presumi-lo — que é o espírito da
   afirmação do §4.10.
3. **Um único serviço serve os dois caminhos.** Tanto a purga automática quanto o
   `DELETE /api/patients/:id` manual chamam esta mesma função. A query de exclusão não é duplicada
   em lugar nenhum, e não existe caminho de exclusão sem verificação.

### 2.1 Formato de resposta escolhido

Das duas alternativas oferecidas, adotada a **resposta 200 com corpo de verificação** (em vez de
204 + endpoint de auditoria consultável):

```json
{"deleted":true,"verified":true,"patientId":4,"remaining":{"patients":0,"eemm_cells":0}}
```

Motivos: numa demonstração ao vivo a prova aparece na própria resposta da chamada, sem segundo
passo nem inspeção de banco; e um log de auditoria persistente seria, ele próprio, um novo canal de
retenção — contrariando o Passo 4 e o princípio que o mecanismo existe para sustentar. Se a
verificação falhar, a rota responde 500 em vez de 200, de modo que a falha não passe silenciosa.

O cliente ignora o corpo da resposta do DELETE ([PatientList.tsx:106](client/src/pages/PatientList.tsx:106)),
então a mudança de 204 para 200 é inerte para a UI — confirmado por execução, não só por leitura
(Seção 4, T8).

---

## 3. Fechamento da lacuna de exportação (Passo 4)

| Verificação | Resultado |
|---|---|
| `git ls-files \| grep sqlite` | **vazio** |
| `.gitignore` cobre os bancos | sim — `.gitignore:57` (`*.sqlite`), `:59` (`*.sqlite-wal`) |
| Dependências de `server/` | `better-sqlite3`, `cors`, `express` — nenhuma de analytics, error-tracking ou telemetria |
| Dependências de `client/` | `react`, `react-dom`, `react-router-dom`, `tailwindcss`, `@tailwindcss/vite` — idem |
| Chamadas de rede de saída em `server/src/` | **nenhuma** (grep por `fetch(`, `axios`, `http.request`, `webhook`, `sentry`, `analytics`, `posthog`, `datadog`) |
| Escrita em disco em `server/src/` | **nenhuma** (grep por `fs`, `writeFile`, `appendFile`, `createWriteStream`) |

**A rotina de purga não persiste nada.** O log é `console.log`/`console.error` apenas — não há
arquivo de log, não há endpoint externo, não há tabela de auditoria. A decisão é deliberada e
alinhada ao Passo 4: um arquivo de log persistente teria de ter política de retenção própria, sob
pena de virar exatamente o canal de retenção indefinida que este mecanismo existe para fechar.

**Conteúdo do log é restrito por design:** apenas ids, timestamps de criação e contagens. Nunca
nome do paciente nem conteúdo clínico. Registrar dado do caso no log recriaria o vazamento dentro
do próprio mecanismo de eliminação.

---

## 4. Verificação ao vivo (Passo 5)

Servidor Express real, com confirmação por **consulta direta ao SQLite** em todos os passos — nunca
apenas pela resposta da API.

### 4.1 Purga automática, ciclo completo (TTL forçado a 30 s, intervalo 5 s)

| Momento | Estado observado no banco |
|---|---|
| Antes de subir o servidor | `patients`: 1 linha (id 1, "João Silva", criado `2026-03-24 01:28:12`); `eemm_cells`: 0 |
| Bootstrap do servidor | Passagem imediata purgou o caso legado, já muito além do TTL |
| Após criar caso novo (id 3) + 2 células | `patients`: id 3, criado `2026-08-11 22:33:17`; `eemm_cells`: **2** |
| t+10 s (dentro do TTL) | `patients`: id 3 presente; `eemm_cells`: **2** — **sobreviveu, como esperado** |
| t+40 s (após expiração) | `patients`: **[]**; `eemm_cells`: **0**; órfãs: **0** |

Log do servidor, na íntegra:

```
Server running on port 3001
[purga] 1 caso(s) expirado(s) (TTL=30s): ids=[1] criados_em=[2026-03-24 01:28:12]
[purga] caso id=1 eliminado e verificado: patients=0, eemm_cells=0 (0 celula(s) removida(s) em cascata)
[purga] varredura automatica ativa: TTL=30s, intervalo=5s
[purga] 1 caso(s) expirado(s) (TTL=30s): ids=[3] criados_em=[2026-08-11 22:33:17]
[purga] caso id=3 eliminado e verificado: patients=0, eemm_cells=0 (2 celula(s) removida(s) em cascata)
```

Confirma os três requisitos: eliminação **sem intervenção manual**; ids registrados **antes** do
DELETE (o log tem valor de rastro porque o id aparece enquanto ainda existe); e verificação
executada e reportada após cada exclusão.

### 4.2 Exclusão manual com verificação

| Passo | Resultado |
|---|---|
| `DELETE /api/patients/4` (caso com 1 célula) | `HTTP 200` — `{"deleted":true,"verified":true,"patientId":4,"remaining":{"patients":0,"eemm_cells":0}}` |
| Confirmação independente no banco | `patients`: 0; `eemm_cells`: 0 |
| Log do servidor | `[purga] caso id=4 eliminado e verificado: patients=0, eemm_cells=0 (1 celula(s) removida(s) em cascata)` |
| Regressão: `DELETE` de paciente inexistente | `HTTP 404` — `{"error":"Patient not found"}`, preservado |

A linha de log do id 4 comprova que a exclusão manual passa pelo **mesmo serviço verificado** da
purga automática.

### 4.3 Restauração do TTL de produção (Passo 5.6)

Servidor reiniciado sem variáveis de ambiente:

```
[purga] varredura automatica ativa: TTL=14400s, intervalo=900s
```

14.400 s = 4 horas; 900 s = 15 minutos. Caso criado em seguida **permaneceu no banco** após 6 s,
confirmando que o TTL curto de teste não vazou para o código.

### 4.4 T8 (Apêndice C) pela interface

Exclusão disparada pela UI real (botão → modal de confirmação → "Excluir"): caso removido da lista,
`patients`: 0 e `eemm_cells`: 0 no banco, e log do servidor registrando
`caso id=6 eliminado e verificado`. A mudança de 204 para 200 não afeta a interface.

### 4.5 Compilação

`npx tsc --noEmit` em `server/` com `strict: true` — **exit 0**.

---

## 5. Nota para o §4.10 do TCC

### 5.1 A frase que este sprint torna verificável

> "ao término de cada sessão de inspeção, rotina programática de purga elimina integralmente os
> registros do caso criado, e a integridade da eliminação é verificada por consulta ao banco
> imediatamente após a execução."

A **segunda metade** da frase passa a ter correspondência exata e demonstrável: a consulta de
verificação existe em `deleteCaseAndVerify()`, roda após cada exclusão (automática ou manual), e seu
resultado é retornado na resposta da API. Um examinador pode pedir a demonstração ao vivo e ela
existe.

### 5.2 A parte da redação que precisa de ajuste

**A primeira metade da frase não é precisa e não deve ser mantida como está.**

O sistema **não tem sessão**. Não há autenticação, login/logout, cookie de sessão nem qualquer
mecanismo que detecte o término de uma sessão de uso. O que foi implementado é purga por
**expiração de tempo desde a criação do caso** — um proxy operacional, não a detecção do evento que
a frase descreve.

Redação sugerida, que descreve o mecanismo real:

> "Rotina programática de purga elimina integralmente os registros de qualquer caso após 4 horas de
> sua criação, independentemente de ação do usuário, executada em varredura automática a cada 15
> minutos. Como o artefato não implementa autenticação nem sessão, esse intervalo opera como teto
> máximo de retenção, e não como detecção do término da sessão de inspeção; a duração foi definida
> para cobrir com folga a sessão única de 60–90 minutos e a consolidação subsequente. A integridade
> da eliminação é verificada por consulta ao banco imediatamente após cada execução, confirmando
> ausência do registro do caso e ausência de linhas remanescentes na tabela de células."

A diferença semântica entre "ao término da sessão" e "após 4 horas da criação" é pequena no efeito
prático, mas é a diferença entre uma afirmação que se sustenta sob questionamento e uma que não se
sustenta. Um examinador que pergunte "como o sistema sabe que a sessão terminou?" tem, com a
redação atual, uma resposta que o código não pode dar.

### 5.3 Limitação que permanece declarada

O histórico do Git ainda contém os arquivos `.sqlite` em commits anteriores a `7e2454b` — a
proteção do Sprint 2 vale daqui para frente. O histórico não foi reescrito por decisão deliberada
(exigiria aprovação explícita, dado o risco sobre o histórico que documenta o processo do TCC).
Isso deve constar como limitação no §4.10, não ser omitido.

---

## 6. Arquivos alterados e criados

### Criados
| Arquivo | Conteúdo |
|---|---|
| `server/src/services/purge.ts` | TTL e intervalo como constantes nomeadas; `deleteCaseAndVerify()`; `purgeExpiredCases()`; `startPurgeScheduler()` |
| `SPRINT_3_LOG.md` | Este documento |

### Alterados
| Arquivo | Mudança |
|---|---|
| `server/src/index.ts` | `startPurgeScheduler()` no bootstrap, após `listen` |
| `server/src/routes/patients.ts` | `DELETE` delega ao serviço compartilhado e responde 200 com o resultado da verificação (500 se a verificação falhar); query de exclusão não é mais duplicada na rota |

---

## 7. O que este sprint não fecha

Da lista pré-registro da auditoria, permanecem abertos:

- **U1 nº 7** — pontos de quebra T5 (ajuda contextual) e T7 (formulação final) do roteiro
- Todos os itens **U2**, incluindo a tela de transparência de armazenamento/retenção (LGPD). Vale
  notar a conexão: agora que existe uma política de retenção real e um valor concreto (4 horas), a
  tela de transparência tem o que informar ao usuário — antes deste sprint, não teria.
- A afirmação do §4.10 sobre **segregação entre dados operacionais e dados de pesquisa** continua
  não verificável: a estrutura de dados de feedback dos avaliadores não existe no schema. Segue
  sendo afirmação sem correspondente, e não foi tocada neste sprint.
- Sinalizações do Sprint 2 ainda em aberto: `lib/` órfão, `artifacts/mockup-sandbox`, e a validação
  do deploy em ambiente Replit real.
