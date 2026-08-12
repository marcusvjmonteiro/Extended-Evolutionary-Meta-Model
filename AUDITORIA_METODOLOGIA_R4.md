# Auditoria de Conformidade Metodológica (DSR/EEMM) — Rodada 4

**Data:** 2026-08-12
**Estado auditado:** commit **`7179f82`** (`master`), com **árvore de trabalho limpa**.
**Foco:** o que os Sprints 7A (transparência LGPD) e 7B (indicador de A4) mudaram, e confirmação
de que nada regrediu do que a Rodada 3 fechou.
**Método:** leitura de código, consulta direta ao SQLite, execução ao vivo (API `:3001`, Vite
`:5173`) e revisão do histórico Git.

> **Auditorias preservadas, nenhuma sobrescrita.** R1 em `git show 3212b95:AUDITORIA_METODOLOGIA.md`;
> R2 em `AUDITORIA_METODOLOGIA.md` (commit `84a2e81`); R3 em `AUDITORIA_METODOLOGIA_R3.md`
> (commit `af011e4`). Esta é a quarta.

> **Rastreabilidade de versão:** `git status` → working tree clean, 0 arquivos pendentes.
> HEAD = `7179f82`. Segunda rodada consecutiva em que o estado auditado corresponde
> integralmente a um commit. Como na R3, este relatório é commitado depois; nenhuma linha de
> código muda entre a auditoria e o commit do relatório.

> **Ressalva de método (inalterada):** o documento do TCC não está no repositório. As citações de
> §4.5, §4.8.4, §4.10, §4.6/§5.1 e Apêndices B/C são as reproduzidas nos pedidos de auditoria.

---

## 1. Sumário executivo

| Métrica | R1 | R2 | R3 | **R4 (atual)** |
|---|---|---|---|---|
| **Tarefas do Apêndice C que quebram** | **4 completas + 1 parcial** | **0 + 1 parcial (T8)** | **0 + 1 parcial (T8)** | **0 — nenhuma, nem parcial** |
| Estrutura da matriz | 6 dim × 4 níveis | 6 dim × 3 níveis = 18 | 8 sistemas × 4 operadores = 32 | **32, inalterada** |
| Taxa de conformidade da matriz | 0/18 (0%) | 18/18 (100%), todas PA | 32/32 (100%) — 24 PF, 8 PA | **32/32 (100%) — 24 PF, 8 PA** |
| Sub-verificações reprovadas no §4.8.4 | 4 de 4 | 1 de 4 | 0 de 4 | **0 de 4** |
| Transparência de armazenamento (LGPD) | ausente | ausente | ausente | **presente e dinâmica** |
| A4 sinalizado na interface | — | — | não sinalizado | **sinalizado em 3 níveis, não bloqueante** |
| Achados P0 abertos | — | 1 | 0 | **0** |
| Itens `VERIFICAR` no mapa | — | 9 de 24 | 17 de 32 | **17 de 32** (infraestrutura criada, 0 verificados) |
| Estado auditado sob controle de versão | não | não | sim — `6790ca8` | **sim — `7179f82`** |

### O marco desta rodada

> **As oito tarefas do roteiro de inspeção (Apêndice C, T1–T8) executam de ponta a ponta, sem
> quebra e sem ressalva, pela primeira vez desde a Rodada 1.**

Na R1, quatro tarefas quebravam por completo (T2, T3, T5, T7) e T8 era parcial. Nas R2 e R3, T8
permaneceu como a única parcial, sempre pela mesma metade — localizar a informação de
armazenamento/retenção. Essa metade está fechada.

### Veredito, sem atenuação

Os dois sprints entregaram o que prometeram, e a verificação mais exigente de cada um passou:

- **7A**: o prazo exibido na página não é texto fixo. Alterando `CASE_TTL_SECONDS` no ambiente e
  reiniciando, a purga e a página se moveram juntas (§2.1).
- **7B**: o indicador não introduziu bloqueio algum, e — o ponto que o pedido mandou conferir com
  atenção redobrada — **a omissão condicional da cláusula de caracterização na formulação está
  correta** (§3.5).

Três coisas que este resultado não deve mascarar:

1. **A dívida bibliográfica não se moveu.** 17 de 32 processos seguem sem base citável, 0 de 17
   linhas da tabela de rastreabilidade preenchidas. É o maior item U1 e continua intacto.
2. **A classificação de 8 células segue PA**, pelo motivo registrado na R3 §4.3 — que é
   exatamente a dívida acima. Nenhuma promoção a PF é devida nesta rodada (§5).
3. **Um arquivo que o próprio pedido desta auditoria pressupõe não existe** (§7.5). Reportado
   como ausente, não presumido.

---

## 2. Bloco Novo 1 — Sprint 7A: transparência LGPD (fecha T8)

### 2.1 O endpoint é dinâmico — provado por alteração de ambiente

`GET /api/config/retention` existe em [server/src/routes/config.ts](server/src/routes/config.ts)
e importa `CASE_TTL_SECONDS` / `PURGE_INTERVAL_SECONDS` de
[purge.ts](server/src/services/purge.ts) — as mesmas constantes que a rotina de purga usa para
operar.

Valor igual não prova origem comum, então o teste foi feito **alterando o ambiente e
reiniciando**, como pedido:

| Momento | Purga anuncia | Endpoint devolve | Página renderiza |
|---|---|---|---|
| Baseline | `TTL=14400s, intervalo=900s` | `{"ttlSeconds":14400,"ttlHuman":"4 horas","purgeIntervalSeconds":900,...}` | — |
| `CASE_TTL_SECONDS=1800`, `PURGE_INTERVAL_SECONDS=300` | `TTL=1800s, intervalo=300s` | `{"ttlSeconds":1800,"ttlHuman":"30 minutos","purgeIntervalSeconds":300,"purgeIntervalHuman":"5 minutos"}` | **"30 minutos"** / "5 minutos" |
| Revertido | `TTL=14400s, intervalo=900s` | `{"ttlSeconds":14400,"ttlHuman":"4 horas",...}` | **"4 horas"** |

**Os três consumidores se moveram juntos, incluindo a página renderizada** — a verificação foi
levada até o navegador, não parou na API. Configuração revertida ao padrão ao fim do teste,
confirmada pelo log de bootstrap e pelo endpoint.

### 2.2 Página e rota

| Item | Estado |
|---|---|
| `client/src/pages/Privacy.tsx` | **presente** |
| Rota `/privacidade` em `App.tsx` | **presente** — `App.tsx:17` |
| Navegação ao vivo | **funciona** — `h1 = "Privacidade e Retenção de Dados"` |
| Seções renderizadas | "Onde as informações ficam", "Por quanto tempo ficam guardadas", "Como são eliminadas", "Você pode excluir a qualquer momento", mais o aviso de dado fictício |

### 2.3 O TTL exibido bate com o backend no momento do teste

Confirmado nos dois estados de configuração (§2.1): a página exibiu "30 minutos" enquanto o
backend operava com 1800s, e "4 horas" após a reversão. **Não é número estático coincidente.**

Busca por literais de prazo no JSX: nenhuma ocorrência de "4 horas", "14400", "15 minutos" ou
"900" — todos os prazos vêm de variável.

### 2.4 Os dois pontos de entrada

| # | Local | Estado | Resultado do acionamento |
|---|---|---|---|
| 1 | Cabeçalho de `EEMMForm.tsx` | **presente**, visível durante todo o fluxo | → `/privacidade`, `h1` correto, TTL "4 horas" |
| 2 | Modal de exclusão de `PatientList.tsx` | **presente** — "Saiba mais sobre como e quando seus dados são eliminados" | → `/privacidade`, `h1` correto |

### 2.5 Tarefa T8 reexecutada por completo

| Metade | R1 | R2 | R3 | **R4** |
|---|---|---|---|---|
| **Localizar** informação de armazenamento/retenção | quebra | quebra | quebra | **EXECUTA** |
| **Excluir** o caso | executa | executa | executa | **EXECUTA** |

Percurso: caso "Auditoria Rodada 4" (id=15) criado com 4 registros; informação localizada pelos
dois pontos de entrada; exclusão confirmada pela UI. Log do servidor:

```
[purga] caso id=15 eliminado e verificado: patients=0, eemm_cells=0,
        eemm_cells_legacy_backup_v2=0 (4 celula(s) removida(s) em cascata)
```

Consulta direta ao banco após a exclusão: `patients: 0`, `eemm_cells: 0`.

> **Pela primeira vez desde a Rodada 1, as duas metades de T8 executam sem quebra.**

---

## 3. Bloco Novo 2 — Sprint 7B: indicador de A4 não caracterizado

### 3.1 Detecção client-side, sem chamada extra

`isUncharacterized()` e `cellHasUncharacterized()` em
[EEMMForm.tsx](client/src/pages/EEMMForm.tsx), operando sobre o dado já carregado.

Contagem de `fetch()` no arquivo: **4**, todas pré-existentes — `/api/patients/:id`,
`/api/patients/:id/eemm`, `/api/eemm/processes` na montagem, e o `PUT` de salvamento. **Nenhum
endpoint novo, nenhuma chamada adicional.**

### 3.2a Nenhuma validação bloqueante no backend — teste explícito

Item marcado como crítico no pedido. Testado nas **duas** variantes:

| Corpo do PUT | Resultado |
|---|---|
| `{"system":"motivation","operator":"retention","valence":"maladaptive","severity_score":8,"notes":null}` | **HTTP 200**, registro gravado |
| `{"system":"attention","operator":"variation","valence":"adaptive","severity_score":5}` — campo `notes` **ausente do corpo** | **HTTP 200**, gravado com `notes: null` |

Nenhum 400, nenhuma exigência do campo `notes`, nenhum diálogo de confirmação. A filosofia de
preenchimento flexível (HU7) está preservada.

### 3.2b Indicador aparece nos dois lugares

Caso com 4 registros pontuados, 2 sem caracterização:

```
CABEÇALHO   ● 2 de 4 registros sem caracterização processual
GRID        Atenção × Variação   -> marcador presente
            Motivação × Retenção -> marcador presente
            Self × Adequação ao Contexto -> SEM marcador (duas valências caracterizadas)
PAINEL de Motivação × Retenção
            seção Adaptativo    -> sem aviso
            seção Desadaptativo -> COM aviso "Sem caracterização processual..."
```

O aviso do painel aparece **apenas na seção de valência correspondente**, não nas duas.

### 3.3 O indicador desaparece ao caracterizar

Texto digitado no campo de caracterização da seção Desadaptativo: o aviso sumiu **antes de
salvar** (lê o rascunho). Após salvar e fechar o painel:

```
CABEÇALHO   ● 1 de 4 registros sem caracterização processual   (era "2 de 4")
GRID        Atenção × Variação -> único marcador remanescente
            Motivação × Retenção -> marcador REMOVIDO
```

### 3.4 Célula com as duas valências completas não exibe indicador

`Self × Adequação ao Contexto`, adaptativo (4) e desadaptativo (6), ambos caracterizados:
**sem marcador**, e os tooltips das duas metades sem o texto explicativo adicional.

### 3.5 Omissão condicional na formulação — o ponto de atenção redobrada

O pedido sinalizou este como fácil de esquecer e não mencionado no prompt do Sprint 7B.
**Verificado com atenção: está correto — e não por acerto do 7B, mas porque o comportamento
precede aquele sprint e não foi quebrado por ele.**

Implementação em [services/formulation.ts](server/src/services/formulation.ts):

```ts
if (cell.notes !== null && cell.notes.trim() !== "") {
  sentence += ` Caracterização do avaliador: "${cell.notes.trim()}"`;
  ...
}
```

Formulação gerada com 2 registros caracterizados e 2 não caracterizados:

```
[SEM]  No sistema Atenção, quanto ao operador de Variação, foi registrado processo
       adaptativo com severidade 5/10.
[COM]  No sistema Self, quanto ao operador de Adequação ao Contexto, foi registrado
       processo adaptativo com severidade 4/10. Caracterização do avaliador: "...".
[COM]  No sistema Self, quanto ao operador de Adequação ao Contexto, foi registrado
       processo desadaptativo com severidade 6/10. Caracterização do avaliador: "...".
[SEM]  No sistema Motivação, quanto ao operador de Retenção, foi registrado processo
       desadaptativo com severidade 8/10.
```

| Verificação | Resultado |
|---|---|
| Sentença composta normalmente sem caracterização | **sim** — termina limpa em "severidade N/10." |
| Cláusula pendente, aspas vazias ou `Caracterização do avaliador: ""` | **nenhuma ocorrência** |
| 2 com cláusula / 2 sem, batendo com o dado | **sim** |

**Consistência entre as duas pontas — verificação que o pedido não solicitou e vale registrar.**
O predicado do cliente é `notes === null || notes.trim() === ""`; o guard do servidor é
`notes !== null && notes.trim() !== ""`. São **complementos exatos**, incluindo o `.trim()`.
Consequência: um registro que o grid marca como não caracterizado é exatamente um cujo texto
omite a cláusula. As duas pontas não podem divergir — inclusive no caso de borda de notas
contendo só espaços em branco.

### 3.6 Contador agregado bate com a contagem real

Existe (Passo 4 do 7B, opcional). Estados observados: **"2 de 4"** com dois registros não
caracterizados de quatro pontuados; **"1 de 4"** após caracterizar um. Confere com a consulta ao
dado. Some por completo quando chega a zero.

---

## 4. Bloco Novo 3 — Rastreabilidade bibliográfica

`docs/verificacao-processos-eemm.md` **existe** (criado no Sprint 8).

| Verificação | Valor |
|---|---|
| Linhas de item na tabela | **17** |
| Linhas com as 4 colunas de citação preenchidas | **0** |
| Linhas **parcialmente** preenchidas | **0** |
| Marcadores `// VERIFICAR:` em `shared/eemm-processes.ts` | **17** |
| Itens com campo `source` preenchido | **0** |
| Campo `source` existe no tipo | **sim** — `ProcessSource` (linha 70), `source?: ProcessSource` (linha 105) |

**Os números batem, sem divergência.** 0 linhas preenchidas ↔ 0 marcadores removidos ↔ 0 campos
`source` preenchidos. A propagação não foi feita de forma inconsistente porque **não foi feita** —
o Sprint 8 criou deliberadamente só a infraestrutura, e registrou isso.

Nada a sinalizar como achado aqui. Registre-se, porém, o que o número significa: **o maior item
U1 da Rodada 3 não avançou nada em conteúdo.** Ganhou o lugar onde será registrado, o que é
condição para a verificação ser auditável, mas não substitui a verificação.

**Nota operacional herdada do Sprint 8:** a contagem de pendências precisa ser escopada ao
arquivo de código (`grep -c "// VERIFICAR:" shared/eemm-processes.ts` → 17). Uma contagem
repo-wide retorna 20, porque o próprio documento de rastreabilidade menciona o marcador três
vezes — menções legítimas, já que ele é sobre o marcador.

---

## 5. Bloco Novo 4 — Recálculo da matriz

**Não aplicável nesta rodada.** A condição de disparo era que ao menos um dos 8 processos dos
sistemas biofisiológico/sociocultural tivesse marcador removido com citação registrada. Nenhum
teve (§4).

As 8 células desses dois sistemas **permanecem PA**, pela mesma justificativa da R3 §4.3: o
material de apoio que sustentaria a caracterização processual é conteúdo novo com 8 de 8 itens
sem base citável.

Registro explícito da regra que o pedido estabeleceu, para a próxima rodada: **promoção parcial
não é válida.** Uma célula de sistema × operador só migra de PA para PF quando **todos** os
processos que a sustentam tiverem citação registrada. Como as 4 células de cada um desses
sistemas compartilham a mesma lista de 4 processos, na prática isso significa: os 4 processos de
`biophysiological` verificados promovem as 4 células daquele sistema em bloco; idem para
`sociocultural`. Verificar 3 de 4 não promove nenhuma.

---

## 6. Blocos herdados — confirmação de não regressão

| Verificação | Resultado |
|---|---|
| Matriz: 64 registros, 8 sistemas × 4 operadores × 2 valências, **32 células** | **inalterada** |
| Taxa ≥80% (≥26 de 32) | **PASSA** — 32/32, 24 PF + 8 PA, 0 AU |
| Nenhum sistema AU nos 4 operadores | **PASSA** |
| 24 células dos 6 sistemas dimensionais PF/PA | **PASSA** |
| Cada operador com A4 satisfeito em ≥1 sistema | **PASSA** — demonstrado ao vivo em variação, seleção (via 7B), retenção e contexto |
| Valor do schema antigo ainda rejeitado | **sim** — `system: "psychological"` → 400 |
| `eemm_cells_legacy_backup` | **ausente** (eliminada no Sprint 5) |
| `eemm_cells_legacy_backup_v2` | **ausente** (nunca criada); coberta por `purge.ts` se vier a existir — 9 referências no módulo |
| Tabelas no banco | `eemm_cells`, `patients`, `sqlite_sequence` — nenhuma tabela residual |
| Dado retido além do TTL | **nenhum** — `patients: 0`, `eemm_cells: 0` após a limpeza |
| `shared/eemm-types.ts` como fonte única | **sim** — `SYSTEMS`/`OPERATORS`/`VALENCES` declarados em exatamente 1 ponto; zero duplicatas em `server/src` e `client/src` |
| Árvore limpa / HEAD | **limpa**, `7179f82` |
| Console do navegador | **sem erros** |
| Defeito cosmético `.".` (nota terminada em ponto) | **ainda presente** — visível em duas sentenças desta rodada. U3, inalterado |

### 6.1 Segregação de dados operacionais / pesquisa — arquivo de decisão AUSENTE

O pedido desta auditoria instrui verificar se o texto do TCC foi ajustado "conforme a decisão
registrada em `/docs/decisions/segregacao-dados-pesquisa.md`".

**Esse arquivo não existe. O diretório `docs/decisions/` também não existe.** `docs/` contém um
único arquivo, `verificacao-processos-eemm.md`.

Reportado como **AUSENTE**, não presumido — nenhum sprint executado até aqui criou esse arquivo,
e nenhum prompt anterior o pediu. A verificação solicitada, portanto, **não pôde ser feita**: não
há decisão registrada contra a qual comparar.

O estado real do item é o mesmo da R3 §6.3: **não há estrutura de feedback de avaliadores no
artefato** (busca por `feedback`, `evaluator`, `sus_`, `questionario` → zero ocorrências), e a
resolução depende de uma pergunta ainda não respondida — *os instrumentos dos Apêndices C/D são
aplicados fora da plataforma?* Se sim, é ajuste de redação no §4.10; se não, é gap de
implementação.

**Recomendação concreta:** criar `docs/decisions/segregacao-dados-pesquisa.md` registrando a
resposta, para que a próxima rodada tenha o que verificar. Enquanto ele não existir, este item
não é auditável dentro do repositório.

---

## 7. Tabela consolidada de gaps remanescentes

| Seção | O que falta | Classificação | Urgência | Risco de defesa | Ação |
|---|---|---|---|---|---|
| §4.5-d | **17 de 32** atribuições sem base citável; 0 de 17 linhas da tabela preenchidas | PARCIAL | **U1** | **ALTO** | Preencher `docs/verificacao-processos-eemm.md` consultando as fontes; depois rodar a propagação |
| §4.8.4 | Texto do TCC ainda descreve 18 células; o artefato tem 32 | AUSENTE | **U1** | **ALTO** | Atualizar o §4.8.4 antes do pré-registro — pré-registrar o número errado é o pior desfecho possível |
| §4.10 | Segregação operacional/pesquisa sem estrutura e **sem decisão registrada** (§6.1) | AUSENTE | **U1** | **ALTO** | Responder à pergunta e registrar em `docs/decisions/segregacao-dados-pesquisa.md` |
| §4.10 | Redação "ao término de cada sessão"; mecanismo é TTL desde a criação | PARCIAL | **U1** | **ALTO** | Corrigir o §4.10. **Ficou mais urgente com o 7A**: a página `/privacidade` agora afirma "a partir do momento em que ele foi criado", e um examinador pode contrastar a tela com a dissertação |
| §4.8.4 | A4 ofertado e não exigido — agora **sinalizado**, ainda não imposto | PARCIAL | **U2** | MÉDIO | **Rebaixado de U1 para U2 nesta rodada.** Decidir a redação: A4 é ofertado pelo instrumento e verificável no dado coletado |
| §4.7 / Bloco 8 | `docker build` nunca executado; deploy não validado em plataforma | PARCIAL | **U2** | MÉDIO | `docker build` + `docker run` fora deste ambiente; publicação de teste |
| Tabela 2 (HC2) | "Severidade" aplicada a processo adaptativo | PARCIAL | **U2** | MÉDIO | Renomear para intensidade, com migração de coluna |
| §4.5-b (NF) | Zero breakpoints Tailwind; grid de 8×4 | AUSENTE | **U2** | BAIXO | Breakpoints; agravado desde a R2 pelo grid maior |
| §4.5-a | Sem indicador de progresso geral (`x/64`) | PARCIAL | **U2** | BAIXO | Contador de cobertura, distinto do contador de caracterização do 7B |
| §4.5-c (NF) | `zod` ausente; `date_of_birth`/`notes` sem validação | PARCIAL | **U2** | BAIXO | Validação por schema |
| Tabela 2 (HU9) | Erros genéricos "Internal server error" | PARCIAL | **U2** | BAIXO | Diferenciar por tipo |
| Tabela 2 (HU3) | Autosave sobrescreve sem histórico | PARCIAL | **U2** | BAIXO | Undo ou histórico por célula |
| — | Nota terminada em ponto gera `.".` | PARCIAL | **U3** | BAIXO | Uma linha em `composeSentence()` |
| Tabela 2 (HU7) | Sem busca/filtro na lista | PARCIAL | **U3** | BAIXO | Campo de busca |
| §4.10 | `.sqlite` em commits anteriores a `7e2454b` | PARCIAL | **U3** | MÉDIO | Declarar como limitação |
| — | Commits por sprint com arquivos em estado final | PARCIAL | **U3** | BAIXO | Sem ação — declarado na R3 §11.1 |
| — | `lib/` órfão, `artifacts/`, `tsconfig.base.json` órfã | PARCIAL | **U3** | BAIXO | Remover após confirmação |

### 7.1 Gaps fechados nesta rodada

| Gap | Como foi fechado |
|---|---|
| §4.5-e — transparência de armazenamento/retenção (LGPD) | Página `/privacidade` com prazos lidos da configuração real; dois pontos de entrada |
| Roteiro — T8 parcial desde a R1 | Metade de "localizar" implementada; **T8 executa integralmente** |
| §4.8.4 — nada distinguia célula caracterizada de célula apenas pontuada | Sinalização em 3 níveis (grid, painel, cabeçalho), não bloqueante |

---

## 8. Lista priorizada — antes do pré-registro OSF

### U1 — bloqueantes

1. **Preencher a tabela de rastreabilidade** e rodar a propagação. 17 itens, 0 feitos. É o maior
   bloco de trabalho pendente e o único que a engenharia não pode resolver sozinha.
2. **Atualizar o §4.8.4 do TCC** para 32 células (8 sistemas × 4 operadores).
3. **Registrar a decisão sobre segregação operacional/pesquisa** em
   `docs/decisions/segregacao-dados-pesquisa.md` e ajustar o §4.10 ou implementar a estrutura.
4. **Corrigir a redação do §4.10** sobre "término de sessão" — agora contrastável com uma tela do
   próprio artefato.

### U2 — antes da coleta

5. `docker build` + `docker run` reais; publicação de teste.
6. Decidir a redação sobre A4 (ofertado vs. imposto).
7. Renomear "severidade" (HC2); responsividade; contador `x/64`; `zod`; erros diferenciados
   (HU9); undo (HU3).

---

## 9. Comparativo entre as quatro rodadas — para a Atividade 3

| Dimensão de avaliação | R1 | R2 | R3 | **R4** |
|---|---|---|---|---|
| **Tarefas do Apêndice C que quebram** | **4 completas + 1 parcial** | **0 + 1 parcial** | **0 + 1 parcial** | **0 — nenhuma** |
| Implementações do artefato no repositório | 2, divergentes | 1 | 1 | 1 |
| Estrutura vs. Hayes et al. (2020) Fig. 1 | 6 dim × 4 níveis, nomenclatura alheia | 6 dim × 3 níveis — leitura equivocada | 8 sistemas × 4 operadores — fiel | fiel |
| Eixo evolucionário | ausente | ausente | um dos dois eixos | um dos dois eixos |
| Células da matriz | 18 (0 conformes) | 18 (18 PA, 0 PF) | 32 (24 PF, 8 PA) | 32 (24 PF, 8 PA) |
| Sub-verificações reprovadas no §4.8.4 | 4 de 4 | 1 de 4 | 0 de 4 | 0 de 4 |
| Afirmações do §4.10 verificáveis | 0 de 4 | 1 plena, 1 parcial, 1 ausente | 2 plenas, 1 parcial, 1 ausente | 2 plenas, 1 parcial, 1 ausente |
| Transparência LGPD na interface | ausente | ausente | ausente | **presente, dinâmica** |
| A4 sinalizado ao avaliador | — | — | não | **sim, não bloqueante** |
| Achados P0 abertos | — | 1 | 0 | 0 |
| Itens `VERIFICAR` | — | 9 de 24 | 17 de 32 | 17 de 32 |
| Infraestrutura de citação (`source` + tabela) | não | não | não | **sim, 0 preenchidos** |
| Artefato containerizável | não | não | preparado, não validado | preparado, não validado |
| Estado sob controle de versão | não | não | sim (`6790ca8`) | sim (`7179f82`) |

### 9.1 O que este comparativo demonstra, e o que não demonstra

**Demonstra** quatro iterações completas do ciclo de rigor da DSR, com cada reprovação preservada
em vez de apagada — a R1 reprovou nas quatro sub-verificações e foi commitada assim (`3212b95`).
A linha do roteiro é a mais legível para uma banca: **4 tarefas quebradas → 1 parcial → 1 parcial
→ nenhuma.**

**Demonstra também**, e este é o achado metodológico mais interessante da série: a R2 registrou
100% de conformidade sobre uma estrutura **errada**. A auditoria passou porque o artefato
correspondia ao que o texto do TCC descrevia, e o texto descrevia mal a fonte primária. Uma
matriz de conformidade vale o que vale a leitura da fonte que a define.

**Não demonstra** prontidão para coleta. A execução do roteiro é condição **necessária** para que
a Atividade 5 produza dados interpretáveis, não suficiente para que produza dados **válidos** —
essa parte depende dos 17 itens de revisão bibliográfica, que não se moveram. Um roteiro que roda
de ponta a ponta sobre conteúdo não verificado produz inspeção fluente sobre material incerto.
