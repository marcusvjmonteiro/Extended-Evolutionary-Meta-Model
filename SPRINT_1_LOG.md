# Sprint 1 — Bivalência e eixo de 3 níveis do EEMM

**Data:** 2026-08-11
**Escopo:** estritamente estrutural — redesenho do schema SQLite para suportar valência
(adaptativo/desadaptativo) e substituição do eixo de 4 níveis pelo eixo correto de 3 níveis
do EEMM (Hayes et al., 2020, 2022).
**Pacotes tocados:** `server/`, `client/`, `shared/` (novo).
**Deliberadamente NÃO tocados:** `artifacts/api-server`, `artifacts/eemm-client` (convergência
é escopo do Sprint 2); formulação textual, ajuda contextual, purga automática e demais itens U2.

Fecha os itens U1 nº 1, 2 e 6 da lista de trabalho pré-registro do relatório de auditoria
([AUDITORIA_METODOLOGIA.md](AUDITORIA_METODOLOGIA.md), Seção 11).

---

## 1. Estado do schema — antes e depois

### 1.1 Antes (schema legado)

```sql
CREATE TABLE eemm_cells (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id      INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  dimension       TEXT NOT NULL,
  level           TEXT NOT NULL,
  severity_score  INTEGER,
  notes           TEXT,
  updated_at      TEXT DEFAULT (datetime('now')),
  UNIQUE(patient_id, dimension, level)
);
```

Eixo de níveis vigente: `biological`, `conditioning`, `cognitive_language`, `group_cultural` (4).
Sem coluna de valência. Nenhum CHECK constraint. Nenhum índice além do implícito da UNIQUE.

**A constraint `UNIQUE(patient_id, dimension, level)` era a causa-raiz estrutural do bug de
bivalência:** um segundo registro para a mesma célula colidia e era sobrescrito pelo
`ON CONFLICT DO UPDATE`, tornando impossível coexistirem um processo adaptativo e um
desadaptativo — independentemente do que a UI oferecesse.

### 1.2 Depois (schema bivalente de 3 níveis)

DDL extraída de `sqlite_master` após a migração real (não transcrita do código):

```sql
CREATE TABLE eemm_cells (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id      INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    dimension       TEXT NOT NULL CHECK (dimension IN ('affect', 'cognition', 'attention', 'self', 'motivation', 'behavior')),
    level           TEXT NOT NULL CHECK (level IN ('biophysiological', 'psychological', 'sociocultural')),
    valence         TEXT NOT NULL CHECK (valence IN ('adaptive', 'maladaptive')),
    severity_score  INTEGER CHECK (severity_score IS NULL OR (severity_score BETWEEN 1 AND 10)),
    notes           TEXT,
    updated_at      TEXT DEFAULT (datetime('now')),
    UNIQUE(patient_id, dimension, level, valence)
);

CREATE INDEX idx_eemm_cells_patient_id ON eemm_cells(patient_id);
```

Teto de registros por caso: 6 dimensões × 3 níveis × 2 valências = **36** (contra 24 do schema
anterior). A matriz de conformidade permanece com **18 células**; cada célula agora é bivalente.

---

## 2. Justificativa da decisão de não migrar dados antigos automaticamente

O banco continha 1 linha em `eemm_cells` no momento da migração:
`cognition × biological`, `severity_score = 7`, notas "Déficit leve".

Essa linha **não tem mapeamento 1:1 para o schema novo**, por duas razões independentes:

1. **Valência inexistente.** O registro legado não carrega valência porque a coluna não existia.
   Atribuir uma na migração (ex.: assumir `adaptive` como default) inventaria um dado clínico que
   nunca foi coletado. O escore 7 num campo chamado "severidade" sugeriria intuitivamente
   `maladaptive`, mas isso é inferência do migrador, não do profissional que registrou — exatamente
   o tipo de fabricação silenciosa de dado que compromete a rastreabilidade da Atividade 3.
2. **Eixo de níveis reformulado.** `biological` → `biophysiological` parece uma tradução óbvia, mas
   os outros três níveis antigos (`conditioning`, `cognitive_language`, `group_cultural`) não têm
   correspondência 1:1 com os três novos: dois deles colapsariam em `psychological` e a decisão de
   qual colapsa em quê é teórica, não mecânica. Migrar só o caso "fácil" e descartar os outros
   produziria um conjunto de dados internamente inconsistente.

**Estratégia adotada:** a linha legada foi copiada integralmente, sem transformação, para
`eemm_cells_legacy_backup`, e a tabela nova nasceu vazia. O dado antigo continua consultável para
auditoria; nenhum dado novo foi fabricado.

Registro adicional de contexto: o único paciente do banco tem, no próprio campo `notes`, o texto
literal **"Paciente de teste"**, e foi criado no mesmo timestamp do commit inicial do projeto —
é seed fictício do agente Replit, não dado clínico real. A condição de alerta do Passo 1
("dados reais além de teste") **não se verificou**. Ainda assim o backup foi executado, porque a
rastreabilidade do processo de migração vale independentemente da natureza do dado.

Saída real da migração no primeiro start após a mudança:

```
[migração] eemm_cells: schema legado substituído pelo schema bivalente de 3 níveis.
1 linha(s) preservada(s) em eemm_cells_legacy_backup; tabela nova iniciada vazia.
```

A migração é **idempotente**: detecta o schema legado pela ausência da coluna `valence` e, uma vez
aplicada, reporta `up-to-date` e não faz nada. Toda a operação (backup + drop + create) roda dentro
de uma única transação.

---

## 3. Resultado da verificação (Passo 6), tarefa por tarefa

Formato herdado do relatório de auditoria anterior. Todas as verificações foram executadas ao vivo
(servidor Express real em `:3001`, frontend Vite real em `:5173`), com confirmação por **consulta
direta ao SQLite**, não apenas pela UI.

| Tarefa | Resultado | Evidência |
|---|---|---|
| **T2** — registrar afeto **adaptativo** em nível **psicológico** | **Executa sem quebra** | `PUT` com `valence: "adaptive"` em `affect × psychological` retornou 200 e gravou a linha id 1. O nível "Psicológico" agora existe como coluna nomeada no grid, o que antes não acontecia. |
| **T3** — registrar afeto **desadaptativo** na **MESMA célula**, sem sobrescrever T2 | **Executa sem quebra — bug estrutural original resolvido** | `PUT` com `valence: "maladaptive"` na mesma dimensão×nível gravou a linha id 2. Consulta direta ao banco confirma **as duas linhas coexistindo**: id 1 (`adaptive`, 6) e id 2 (`maladaptive`, 9). No schema anterior a segunda escrita teria sobrescrito a primeira. |
| **T4** — percorrer as 5 dimensões restantes nos 3 níveis corretos | **Executa sem quebra** | 30 `PUT`s (5 dimensões × 3 níveis × 2 valências), 30 sucessos, 0 falhas. Estado final: 32 linhas, 16 células dimensão×nível distintas, **todas as 16 com as duas valências presentes**. |

### 3.1 Verificações de regressão adicionais

| Verificação | Resultado |
|---|---|
| Upsert da **mesma** valência atualiza no lugar, sem criar terceira linha | OK — re-`PUT` em `affect × psychological × adaptive` manteve `id = 1` e alterou o escore de 6 para 4; a linha `maladaptive` permaneceu intacta |
| `GET /api/patients/:id/eemm` retorna a grade completa | OK — exatamente **36** entradas, com as 6 dimensões, os 3 níveis novos e as 2 valências |
| Rejeição de valência inválida | OK — `{"error":"Field 'valence' must be one of: adaptive, maladaptive"}` |
| Rejeição de nível do **schema antigo** (`conditioning`) | OK — `{"error":"Field 'level' must be one of: biophysiological, psychological, sociocultural"}` |
| Rejeição de `severity_score` fora de 1–10 | OK — validação preservada inalterada |
| Autosave por valência (UI, sem clicar em Salvar) | OK — preenchidas as duas valências de `affect × biophysiological` no painel e fechado o painel pelo overlay; as duas gravaram como linhas independentes (id 34 e 35) num único fechamento |
| Grid reflete o estado do banco | OK — célula passou a exibir `A 5 / D 7`; célula não registrada permanece `A — / D —` |
| Console do navegador | Sem erros de aplicação na sessão |

### 3.2 Compilação em modo strict

| Pacote | Comando | Resultado |
|---|---|---|
| `server/` | `npx tsc --noEmit` | **exit 0** |
| `client/` | `npx tsc --noEmit` | **exit 0** |

Ambos com `"strict": true` preservado (não foi alterado em nenhum dos dois, conforme instruído).
Vale registrar que o `noUnusedLocals` do client capturou uma função auxiliar residual durante o
desenvolvimento (`emptyDraft`), que foi removida — o rigor de compilação está de fato ativo, não
apenas declarado.

**Consequência para o §4.6/§5.1 do TCC:** a afirmação de que a tipagem estática preserva a
integridade da estrutura dimensão × nível × valência passa a ter correspondente material. O
arquivo a exibir a um examinador que peça para ver essa estrutura é
[shared/eemm-types.ts](shared/eemm-types.ts), agora com os três eixos declarados como uniões
literais e consumido pelas duas pontas a partir da mesma fonte. Antes deste sprint o eixo de
valência não existia em tipo nenhum e as dimensões eram redeclaradas independentemente no backend
e no frontend.

---

## 4. Arquivos alterados e criados

### Criados

| Arquivo | Conteúdo |
|---|---|
| `shared/eemm-types.ts` | Fonte única de verdade: `DIMENSIONS`, `LEVELS`, `VALENCES`, tipos `Dimension`/`Level`/`Valence` e os três mapas de rótulos em português |
| `SPRINT_1_LOG.md` | Este documento |

### Alterados

| Arquivo | Mudança |
|---|---|
| `server/src/database.ts` | Migração explícita com backup do schema legado; DDL nova com CHECK constraints gerados a partir das constantes compartilhadas; índice em `patient_id`; importa de `@shared/eemm-types` |
| `server/src/routes/eemm.ts` | Constantes locais removidas em favor do import compartilhado; validação de `valence`; `GET` retorna 36 entradas; `ON CONFLICT` usa a constraint composta de 4 colunas |
| `server/tsconfig.json` | `baseUrl` + `paths` (`@shared/*`); `include` passa a cobrir `../shared`; `rootDir` removido (ver Seção 5.1) |
| `server/package.json` | `tsconfig-paths` como devDependency; script `dev` passa a carregar `-r tsconfig-paths/register`; novo script `typecheck` |
| `server/package-lock.json` | Instalação de `tsconfig-paths` |
| `client/src/pages/EEMMForm.tsx` | Redeclaração local removida em favor do import compartilhado; grid de 6×4 para 6×3; célula bivalente com duas metades; painel com duas seções independentes; autosave por valência |
| `client/tsconfig.json` | `baseUrl` + `paths` (`@shared/*`); `include` passa a cobrir `../shared` |
| `client/vite.config.ts` | `resolve.alias` espelhando o alias do tsconfig; `server.fs.allow` liberando `shared/` |

`server/database.sqlite` e seus arquivos `-wal`/`-shm` foram **restaurados ao estado commitado**
após a verificação (ver Seção 5.6).

---

## 5. Desvios e decisões que precisam de rastreabilidade

### 5.1 `rootDir` removido de `server/tsconfig.json` (desvio necessário)

`shared/` fica fora de `server/src`, e o TypeScript recusa arquivos do programa que estejam fora do
`rootDir` declarado. Como `server/package.json` **não tem script de build** (só `dev` via ts-node),
nenhum layout de emissão dependia desse `rootDir` — a remoção não altera comportamento observável.
Adicionei um script `typecheck` explícito para que a checagem seja executável de forma isolada.
Se um build real com `tsc` for introduzido no futuro, o layout de `outDir` precisará ser reavaliado.

### 5.2 Dependência nova: `tsconfig-paths` (desvio necessário)

O enunciado pediu para resolver o compartilhamento **por configuração**, não por caminhos relativos
frágeis. O `paths` do TypeScript, porém, é resolvido **apenas em tempo de compilação**: em tempo de
execução o `require` do Node/ts-node (CommonJS) não conhece o alias e falharia. `tsconfig-paths` é
o resolvedor de runtime correspondente, carregado via `-r` no script `dev`.

Alternativas descartadas: import relativo `../../shared/eemm-types` (explicitamente excluído pelo
enunciado); transformar `shared/` em pacote com `file:` dependency (o ts-node ignora `node_modules`
por padrão, o que traria fragilidade dependente de symlink no Windows). No frontend não houve custo
equivalente — o Vite resolve o alias nativamente via `resolve.alias`, sem dependência adicional.

### 5.3 CHECK constraints acrescentados à DDL (adição além do especificado)

A DDL do enunciado declarava `valence TEXT NOT NULL` com a restrição de domínio expressa apenas em
comentário. Implementei CHECK constraints em `dimension`, `level` e `valence`, **gerados por
interpolação a partir dos arrays de `shared/eemm-types.ts`**, de modo que o banco rejeite qualquer
valor que o sistema de tipos não reconheça. Acrescentei também um CHECK em `severity_score`
(`NULL` ou 1–10), espelhando no banco a validação que antes existia só na camada de API.

Justificativa: o §4.5 (NF-c) do TCC exige "integridade estrutural dos dados inseridos (validação,
não apenas tipagem)". Constraints no banco são a única barreira que sobrevive a um acesso que não
passe pela API. A interpolação em SQL é segura aqui por construção — os valores são constantes de
compilação do próprio projeto, nunca entrada de usuário.

**Isto é uma adição, não uma contradição ao pedido** — mas está documentado porque a DDL final
difere literalmente da DDL escrita no enunciado.

### 5.4 Solução visual para a célula bivalente (decisão de design, pedida em aberto)

O enunciado pediu para propor e implementar uma solução para os quatro estados possíveis de uma
célula (só adaptativo, só desadaptativo, ambos, nenhum). Implementado:

- **Matiz** codifica a **valência**: verde = adaptativo, vermelho = desadaptativo.
- **Saturação** codifica o **escore**: 1–3 mais claro, 4–6 intermediário, 7–10 mais escuro.
- **Metade cinza tracejada** = valência não registrada.
- Cada metade leva o marcador `A` / `D`, para não depender só de cor (acessibilidade).

A escolha de separar matiz e saturação foi deliberada: o esquema anterior (verde/amarelo/vermelho
por severidade) faria "vermelho" significar simultaneamente *grave* e *desadaptativo*, que são
eixos independentes no metamodelo. Uma célula com processo adaptativo intenso apareceria em
vermelho e seria lida como problema.

### 5.5 Tensão semântica não resolvida: `severity_score` aplicado a processo adaptativo (observação)

O campo permanece `severity_score` com rótulo "Nível de Severidade" na UI, exatamente como o
enunciado determinou ("mantenha a validação de severity_score (1-10) exatamente como está hoje";
"cada uma com seu próprio slider de severidade").

Registro a tensão conceitual sem alterá-la: falar em *severidade* de um processo **adaptativo** é
semanticamente estranho — o que se está medindo ali é mais próximo de *intensidade*, *força* ou
*grau de presença* do processo. Isso é candidato natural a um item de sprint futuro (renomear o
campo e o rótulo, com migração de coluna), e é o tipo de detalhe terminológico que a inspeção por
especialistas (Atividade 5) tende a capturar sob a heurística de fidelidade terminológica.
**Não foi alterado neste sprint por estar fora do escopo autorizado.**

### 5.6 Banco de dados restaurado ao estado commitado após a verificação (decisão de higiene)

A verificação do Passo 6 gravou 34 linhas de teste no banco. Como `server/database.sqlite` e seus
arquivos auxiliares **são versionados no Git** (achado P0 da auditoria anterior, item U1 nº 4, cuja
correção está fora do escopo deste sprint), deixá-los alterados injetaria dado fictício com aparência
clínica no histórico do repositório. Os três arquivos foram restaurados ao estado commitado com
`git checkout`.

Consequência prática: o banco no repositório continua com o **schema legado**, e a migração
executará no próximo start do servidor — comportamento já verificado ao vivo neste sprint. Nada se
perde, e o diff do commit fica restrito a código.

Nota técnica: em modo WAL, `database.sqlite` sequer aparecia como modificado no `git status` — as
escritas ficam em `database.sqlite-wal` até o checkpoint. Isso é mais um argumento a favor de
remover os três arquivos do versionamento (item U1 nº 4): o estado real do banco não é legível pelo
diff do arquivo principal.

---

## 6. O que este sprint não fecha

Permanecem abertos, da lista pré-registro da auditoria:

- **U1 nº 3** — rotina automática de purga + verificação pós-purga (§4.10)
- **U1 nº 4** — remover os arquivos `.sqlite*` do controle de versão
- **U1 nº 5** — convergir `artifacts/api-server` e `artifacts/eemm-client`, que **seguem com o eixo
  de níveis trocado por operadores evolucionários** e agora divergem também deste sprint (Sprint 2)
- **U1 nº 7** — pontos de quebra T5 (ajuda contextual) e T7 (formulação final) do roteiro
- Todos os itens **U2**

Sobre a matriz de conformidade da Seção 4.8.4: este sprint remove as duas causas estruturais que
mantinham as 18 células em AU (ausência do eixo de valência e eixo de níveis incorreto). A
reclassificação formal das células, porém, **não deve ser declarada com base apenas neste sprint** —
os critérios A2 (fidelidade terminológica) e A4 (dinâmica evolucionária) continuam sem
correspondência no código, e A4 em particular não tem nenhuma funcionalidade associada em nenhuma
das duas cópias do artefato. Uma nova rodada de auditoria após o Sprint 2 é o momento adequado para
recalcular a taxa.
