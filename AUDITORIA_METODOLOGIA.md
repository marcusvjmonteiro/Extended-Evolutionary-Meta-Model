# Auditoria de Conformidade Metodológica (DSR/EEMM) — Estado Atual do Código

**Data da auditoria:** 2026-08-11
**Método:** leitura integral do código-fonte (`server/`, `client/`, `artifacts/`, `lib/`, `shared/`), inspeção do histórico Git commit a commit, e execução real da aplicação (API em `:3001`, frontend Vite em `:5173`) com percurso ao vivo do roteiro de tarefas do Apêndice C.
**Escopo não coberto:** o próprio documento de metodologia (TCC) não estava disponível como arquivo neste repositório — as afirmações de §4.5, §4.8.4, Tabela 2, Tabela 4, Tabela 6, Apêndice C, §4.6, §5.1 e §4.10 citadas abaixo são as reproduzidas literalmente no pedido de auditoria. Onde a definição exata de uma heurística (HU/HC) não foi fornecida, isso é sinalizado explicitamente em vez de inventada.

---

## 1. Sumário executivo

| Métrica | Resultado |
|---|---|
| Taxa de conformidade da matriz EEMM (Bloco 2) | **0/18 células (0%)** |
| Veredito no critério a priori (§4.8.4, ≥80%/≥15 células) | **FALHA** |
| Dimensão AU nos 3 níveis simultaneamente (condição de reprovação automática) | **Sim — as 6 dimensões estão AU nos 3 níveis** |
| 6 células do nível psicológico todas PF/PA | **Não — 0/6** |
| 4 operadores evolucionários presentes em alguma funcionalidade | **Não** |
| Afirmações do §4.10 sem correspondência verificável no código | **4 de 4** |
| Achado adicional de maior risco (não previsto nos blocos, encontrado na auditoria) | Banco de dados SQLite real (`server/database.sqlite*`, com paciente de teste "João Silva") está **versionado no Git**, não no `.gitignore` |

**Leitura direta:** no estado atual, o artefato **não passaria** no critério de conformidade estrutural declarado a priori na Seção 4.8.4. A causa não é falta de polimento de UI — é ausência estrutural de duas dimensões inteiras do metamodelo (bivalência e dinâmica evolucionária) no schema do banco de dados, o que nenhuma alteração de frontend resolve sozinha. Isso é reportado sem suavização, conforme instruído: reprovar é um desfecho válido do critério pré-registrado, e mascará-lo agora custaria mais caro depois de um pré-registro OSF travar o instrumento.

---

## 2. Bloco 0 — Inventário técnico

### 2.1 Duas implementações paralelas no mesmo repositório

O repositório contém **dois pares client/server distintos e não sincronizados**:

1. **`server/` + `client/`** — Express 4 + `better-sqlite3` + React/Vite puro (Tailwind inline, sem componentes de UI). É o código-fonte editado diretamente nos commits de funcionalidade (`e5ced1b`, `30f7bb7`, `1db1307`) e é o que o `.replit` efetivamente executa em desenvolvimento (`[[workflows.workflow]]` roda `cd server && npm run dev` e `cd client && npm run dev`, portas 3001/5173).
2. **`artifacts/api-server/` + `artifacts/eemm-client/`** — uma cópia gerada pelo agente Replit (mesmo conteúdo inicial de `server`/`client`, mas com roteamento em estilo diferente, `db.ts` próprio, componentes shadcn/ui não utilizados pelas páginas reais) e registrada em `.replit` como artefato de deploy (`[[artifacts]] id = "artifacts/api-server"`).

**Essas duas cópias já divergiram de forma conceitualmente incorreta.** O commit `336fe44` ("Update EEMM grid columns to Variação, Seleção, Retenção") alterou **apenas** `artifacts/api-server/src/routes/eemm.ts` e `artifacts/eemm-client/src/pages/EEMMForm.tsx`, substituindo o array `LEVELS` (que continha `biological/conditioning/cognitive_language/group_cultural`) por `variation/selection/retention`. Isso troca o eixo "nível" pelo eixo "operadores evolucionários" — dois eixos distintos do metamodelo — dentro da cópia de deploy, **sem tocar** `server/src/routes/eemm.ts` nem `client/src/pages/EEMMForm.tsx`, que continuam com o esquema antigo de 4 níveis. Resultado prático: a versão que roda no fluxo de desenvolvimento (`server`/`client`) e a versão registrada para deploy (`artifacts/api-server`) têm **matrizes EEMM estruturalmente diferentes e mutuamente incompatíveis**. Ver detalhamento no Bloco 5 e Bloco 7.

Este relatório usa **`server/` + `client/`** como referência principal (é o que roda via `npm run dev` e o que foi validado ao vivo na Seção 8), citando `artifacts/` apenas onde a divergência é relevante.

### 2.2 Árvore de rotas (Express — `server/src/index.ts` + `server/src/routes/`)

| Método | Rota completa | Arquivo:linha | Descrição |
|---|---|---|---|
| GET | `/health` | [server/src/index.ts:13](server/src/index.ts:13) | health check simples |
| GET | `/api/patients` | [server/src/routes/patients.ts:6](server/src/routes/patients.ts:6) | lista pacientes |
| POST | `/api/patients` | [server/src/routes/patients.ts:17](server/src/routes/patients.ts:17) | cria paciente |
| GET | `/api/patients/:id` | [server/src/routes/patients.ts:42](server/src/routes/patients.ts:42) | busca paciente |
| DELETE | `/api/patients/:id` | [server/src/routes/patients.ts:59](server/src/routes/patients.ts:59) | remove paciente (cascade nas células) |
| GET | `/api/patients/:id/eemm` | [server/src/routes/eemm.ts:25](server/src/routes/eemm.ts:25) | retorna as 24 células (6×4) do caso |
| PUT | `/api/patients/:id/eemm` | [server/src/routes/eemm.ts:73](server/src/routes/eemm.ts:73) | upsert de uma célula |

Não existem rotas de: autenticação, exportação, purga/expurgo, geração de formulação, ajuda/documentação, feedback de avaliadores, ou qualquer endpoint de administração/observabilidade além de `/health`.

### 2.3 Models/schema (SQLite — `server/src/database.ts:9-28`)

```
patients
  id              INTEGER PK AUTOINCREMENT
  name            TEXT NOT NULL
  date_of_birth   TEXT
  notes           TEXT
  created_at      TEXT DEFAULT datetime('now')

eemm_cells
  id              INTEGER PK AUTOINCREMENT
  patient_id      INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE
  dimension       TEXT NOT NULL
  level           TEXT NOT NULL
  severity_score  INTEGER            -- 1..10, validado em eemm.ts:90-102
  notes           TEXT
  updated_at      TEXT DEFAULT datetime('now')
  UNIQUE(patient_id, dimension, level)
```

Duas tabelas, ponto final. Não há coluna de valência, não há tabela de "processos de mudança" de referência, não há tabela de feedback de avaliadores/pesquisa, não há tabela ou campo de auditoria de exclusão.

`DIMENSIONS` (6, [server/src/routes/eemm.ts:6-13](server/src/routes/eemm.ts:6)): `cognition, affect, attention, self, behavior, motivation` — cobre as 6 dimensões do EEMM.
`LEVELS` (4, [server/src/routes/eemm.ts:15-20](server/src/routes/eemm.ts:15)): `biological, conditioning, cognitive_language, group_cultural` — **4 níveis, não 3**, com nomenclatura que não corresponde a "biofisiológico/psicológico/sociocultural" (ver Bloco 2 e Bloco 5).

### 2.4 Componentes de frontend do fluxo de criação/edição de caso

`client/src/App.tsx` define exatamente 3 rotas, sem rota-fallback (`*`):

- `/` → redirect para `/patients`
- `/patients` → [PatientList.tsx](client/src/pages/PatientList.tsx) (listar, criar, excluir paciente)
- `/patients/:id/eemm` → [EEMMForm.tsx](client/src/pages/EEMMForm.tsx) (grid 6×4 + painel lateral de edição de célula)

Não há componente de ajuda, de formulação final, de configurações de privacidade/armazenamento, de exportação, ou de autenticação. Navegar para qualquer rota não declarada (testado ao vivo: `/patients/1/formulation`) renderiza **página em branco**, sem 404 nem mensagem — não há `<Route path="*">`.

### 2.5 TypeScript strict mode

- [client/tsconfig.json:11](client/tsconfig.json:11) — `"strict": true` ✅
- [server/tsconfig.json:6](server/tsconfig.json:6) — `"strict": true` ✅
- [tsconfig.base.json](tsconfig.base.json) (raiz, usado apenas pelo monorepo `lib/db` + `lib/api-*`, que **não é consumido por `server/` nem `client/`**) — **não** ativa `strict` e define explicitamente `"strictFunctionTypes": false`. Irrelevante para a aplicação real, mas é uma inconsistência do repositório que merece nota: existe um segundo conjunto de regras de TypeScript, mais frouxo, coexistindo com o app real.

Conclusão factual: as duas partes que efetivamente rodam (`server`, `client`) **estão** em modo strict. Isso é positivo e será qualificado no Bloco 5, porque "strict ligado" não é o mesmo que "a estrutura de tipos replica dimensão × nível × valência".

### 2.6 Persistência SQLite

- Inicializada em [server/src/database.ts:1-30](server/src/database.ts:1): `better-sqlite3`, arquivo em `server/database.sqlite` (caminho absoluto via `path.join(__dirname, "..", "database.sqlite")`), `journal_mode = WAL`, `foreign_keys = ON`.
- **Achado crítico não previsto nos blocos, mas com impacto direto no Bloco 4/§4.10**: `server/database.sqlite`, `server/database.sqlite-shm` e `server/database.sqlite-wal` **estão versionados no Git** (`git ls-files` confirma), e o `.gitignore` não os exclui. O arquivo já contém um registro de paciente de teste ("João Silva", nascido 15/05/1990) confirmado ao vivo nesta auditoria. Existe uma segunda cópia divergente do mesmo banco em `artifacts/api-server/database.sqlite*`, também versionada. Isso significa que qualquer dado inserido durante testes/demonstrações é permanentemente gravado no histórico do Git — um canal de retenção/exportação de dados que nenhuma "rotina de purga" em runtime consegue desfazer.

---

## 3. Bloco 1 — Objetivos funcionais e não funcionais (§4.5)

### Funcionais

| # | Objetivo | Classificação | Evidência / o que falta |
|---|---|---|---|
| (a) | Guiar pelas dimensões/níveis do EEMM de forma **estruturada e sequencial** | **PARCIAL** | Estruturado: sim — grid fixo 6×4 em [EEMMForm.tsx:216-283](client/src/pages/EEMMForm.tsx:216). Sequencial/guiado: não — todas as 24 células são clicáveis em qualquer ordem, sem stepper, sem indicador de progresso, sem bloqueio de navegação. Falta um componente de fluxo guiado (ex.: `<EEMMWizard step={n} onNext={...}>`) e um contador de progresso (`x/24 células preenchidas`) — nenhum dos dois existe hoje. |
| (b) | Gerar formulação **textual E visual** | **PARCIAL** | Visual: IMPLEMENTADO — grid colorido por severidade ([EEMMForm.tsx:255-276](client/src/pages/EEMMForm.tsx:255)). Textual: **AUSENTE** — busca por `formula` no código retorna zero lógica de síntese/geração; a palavra só aparece como rótulo de UI ("Formulação EEMM"). Falta uma função nova, ex. `POST /api/patients/:id/eemm/summary` no backend + componente `FormulationSummary.tsx` no frontend, que hoje não existem em nenhuma forma. |
| (c) | Armazenamento, recuperação e edição de casos **durante a sessão** | **IMPLEMENTADO** | CRUD completo e persistente (excede o requisito — persiste além da sessão): [patients.ts:6-40](server/src/routes/patients.ts:6) (criar/listar), [patients.ts:42-57](server/src/routes/patients.ts:42) (ler), [eemm.ts:73-139](server/src/routes/eemm.ts:73) (upsert de célula). Validado ao vivo nesta auditoria (T1, T4, T6). |
| (d) | Exibir referências aos **processos de mudança** associados a cada dimensão | **AUSENTE** | Nenhuma tabela, constante ou componente de referência a processos de mudança (fusão cognitiva, evitação experiencial, etc.) existe no código. Falta uma fonte de dados nova (ex. `shared/processes.ts` com mapa dimensão→processos) e um elemento de UI que a exiba no painel lateral. |
| (e) | Registro da **valência adaptativa/desadaptativa** (bivalência) de cada processo | **AUSENTE** | Schema `eemm_cells` ([database.ts:18-27](server/src/database.ts:18)) não tem coluna de valência. `severity_score` é um único escalar 0-10, sem polaridade. Confirmado ao vivo: o painel de célula (`AFETO — CONDICIONAMENTO`) só tem slider de severidade + notas, nenhum controle adaptativo/desadaptativo. Falta: coluna `valence TEXT CHECK(valence IN ('adaptive','maladaptive'))` na tabela, remoção da constraint `UNIQUE(patient_id, dimension, level)` em favor de `UNIQUE(patient_id, dimension, level, valence)` (para permitir os dois registros por célula), e o controle correspondente na UI. |

### Não funcionais

| # | Objetivo | Classificação | Evidência / o que falta |
|---|---|---|---|
| (a) | Acessível via navegador sem instalação local | **IMPLEMENTADO** | SPA React servida via Vite + API REST; validado ao vivo em `localhost:5173`. |
| (b) | Interface responsiva com terminologia EEMM em português | **PARCIAL** | Terminologia PT-BR: sim, nos rótulos das dimensões ([EEMMForm.tsx:18-25](client/src/pages/EEMMForm.tsx:18)). Responsividade: **zero breakpoints Tailwind** (`sm:`/`md:`/`lg:`) encontrados em `EEMMForm.tsx` ou `PatientList.tsx` — grep confirma ausência total. O grid usa `max-w-6xl` fixo; em telas estreitas a tabela de 5 colunas não tem tratamento definido. Falta adicionar breakpoints ou um layout alternativo para mobile. |
| (c) | Integridade estrutural dos dados **(validação, não apenas tipagem)** | **PARCIAL** | Existe validação manual ad hoc: nome obrigatório ([patients.ts:20-23](server/src/routes/patients.ts:20)), enum de `dimension`/`level` ([eemm.ts:76-88](server/src/routes/eemm.ts:76)), `severity_score` inteiro 1-10 ([eemm.ts:90-102](server/src/routes/eemm.ts:90)). Mas: `date_of_birth` e `notes` não têm nenhuma validação de formato/tamanho; não há biblioteca de schema (Zod, Joi) — cada rota reimplementa checagens à mão, o que já causou divergência entre as duas cópias do repositório (`artifacts/api-server/src/routes/patients.ts` valida `req.body` com um cast de tipo diferente do de `server/src/routes/patients.ts`, sem validação runtime real em nenhum dos dois). |
| (d) | Viabilidade de manutenção em ambiente de baixo custo | **IMPLEMENTADO** (com ressalva) | SQLite embarcado + Express minimalista = custo de manutenção baixo em si. A ressalva de custo/governança é sobre o **hosting** (Repl.it), tratada no Bloco 7. |
| (e) | Transparência quanto a local de armazenamento, retenção e eliminação (LGPD) | **AUSENTE** | Nenhuma rota, página ou texto de UI menciona onde os dados ficam armazenados, por quanto tempo, ou como são eliminados. O modal de exclusão de paciente ([PatientList.tsx:288-316](client/src/pages/PatientList.tsx:288)) diz apenas "Todas as células da formulação EEMM serão removidas junto" — não diz onde estavam, nem confirma a eliminação após o fato. Confirmado ao vivo (T8, Bloco 6): não existe onde "localizar" essa informação porque ela não existe na aplicação. |

---

## 4. Bloco 2 — Matriz de conformidade EEMM (§4.8.4)

### 4.1 Nota metodológica sobre o mapeamento de níveis

O código implementa **4 níveis** (`biological, conditioning, cognitive_language, group_cultural`), não os **3 níveis** exigidos pelo critério a priori (`biofisiológico, psicológico, sociocultural`). Para poder preencher a matriz 6×3 solicitada, adoto o mapeamento mais favorável possível ao artefato:

- **biofisiológico** ← `biological` ("Biológico/Evolutivo")
- **psicológico** ← união de `conditioning` + `cognitive_language` (nenhum dos dois se chama "psicológico"; são dois campos distintos e não consolidados no schema)
- **sociocultural** ← `group_cultural` ("Grupo/Cultural")

Esse mapeamento já é uma concessão interpretativa — o código, em si, não declara essa correspondência em nenhum lugar (nem tipo, nem comentário, nem constante). É o mapeamento mais caridoso que um avaliador consegue construir, e ainda assim falha nos critérios A2/A3/A4 abaixo.

### 4.2 Matriz 6×3 completa

Critérios aplicados por célula, por dimensão × nível:
- **A1** (presença): existe campo/fluxo que capture a célula?
- **A2** (fidelidade terminológica): o rótulo corresponde ao termo EEMM sem sinônimo de outra tradição?
- **A3** (bivalência): permite adaptativo E desadaptativo?
- **A4** (dinâmica evolucionária): permite variação/seleção/retenção/adequação ao contexto?

| Dimensão | Biofisiológico (A1/A2/A3/A4) | Psicológico (A1/A2/A3/A4) | Sociocultural (A1/A2/A3/A4) |
|---|---|---|---|
| Afeto | parcial / parcial / não / não → **AU** | parcial / não / não / não → **AU** | parcial / parcial / não / não → **AU** |
| Cognição | parcial / parcial / não / não → **AU** | parcial / não / não / não → **AU** | parcial / parcial / não / não → **AU** |
| Atenção | parcial / parcial / não / não → **AU** | parcial / não / não / não → **AU** | parcial / parcial / não / não → **AU** |
| Self | parcial / parcial / não / não → **AU** | parcial / não / não / não → **AU** | parcial / parcial / não / não → **AU** |
| Motivação | parcial / parcial / não / não → **AU** | parcial / não / não / não → **AU** | parcial / parcial / não / não → **AU** |
| Comportamento manifesto | parcial / parcial / não / não → **AU** | parcial / não / não / não → **AU** | parcial / parcial / não / não → **AU** |

**18/18 células = AU.** Justificativa da não-atribuição de PA: o critério do documento permite PA "só se você conseguir formular a justificativa de design" para a lacuna. Não há justificativa de design defensável para a ausência total de bivalência e de dinâmica evolucionária em 18/18 células — não é uma adaptação deliberada documentada em nenhum lugar do código ou dos commits; é escopo não implementado. Por isso a classificação honesta, seguindo a própria instrução do critério, é AU em todas as células, não PA.

### 4.3 Verificações do critério a priori (§4.8.4)

| Verificação | Resultado |
|---|---|
| Taxa de conformidade ≥ 80% (≥15/18) | **0/18 (0%) — FALHA** |
| Nenhuma dimensão AU nos 3 níveis simultaneamente | **FALHA** — as 6 dimensões estão AU nos 3 níveis |
| As 6 células do nível psicológico são todas PF/PA | **FALHA** — 0/6 |
| Os 4 operadores evolucionários aparecem em ao menos uma funcionalidade, mesmo transversal | **FALHA** — não existem na versão executada (`server`/`client`). Na cópia de deploy (`artifacts/`), os *rótulos* "Variação/Seleção/Retenção" existem, mas substituindo o eixo "nível" em vez de implementar um eixo/funcionalidade próprio de dinâmica evolucionária — é um erro conceitual, não uma implementação parcial válida, e não conta a favor deste critério. |

**Veredito do Bloco 2, sem atenuação: o artefato, no estado atual do código, FALHA no critério de conformidade estrutural declarado a priori na Seção 4.8.4**, em todas as quatro sub-verificações, não apenas na taxa agregada.

---

## 5. Bloco 3 — Heurísticas (Tabela 2)

**Ressalva de método:** o texto completo da Tabela 2 (definições exatas de HU1-HU10 e HC1-HC4) não foi fornecido nesta auditoria. Uso abaixo o conjunto padrão de 10 heurísticas de Nielsen para HU1-HU10 (convenção usual em trabalhos de HCI em português) e infiro HC1/HC2/HC4 a partir do contexto clínico do instrumento — apenas HC3 ("segurança clínica do output") foi definida explicitamente no pedido. Se a Tabela 2 real do TCC nomear heurísticas diferentes, esta seção precisa ser re-executada com o texto correto antes da submissão.

| # | Heurística (inferida) | Evidência estrutural encontrada | Severidade provável (Nielsen 0-4) | Violação mais provável |
|---|---|---|---|---|
| HU1 | Visibilidade do status do sistema | Estados de loading/save existem ("Carregando...", "Salvando...", "✓ Salvo" — [EEMMForm.tsx:459-464](client/src/pages/EEMMForm.tsx:459)); falta indicador de progresso agregado (x/24 células) | 1 | Ausência de indicador de completude do caso |
| HU2 | Correspondência com o mundo real / linguagem do usuário | Rótulos de dimensão em PT-BR corretos; rótulos de nível não usam terminologia EEMM (ver Bloco 2/5) | 2 | Nomenclatura de nível incoerente com a literatura citada |
| HU3 | Controle e liberdade do usuário (desfazer) | Exclusão de paciente tem confirmação ([PatientList.tsx:288-316](client/src/pages/PatientList.tsx:288)); edição de célula faz **autosave silencioso ao fechar o painel** ([EEMMForm.tsx:109-120](client/src/pages/EEMMForm.tsx:109)) sem histórico nem desfazer — o valor anterior é sobrescrito sem confirmação | 2 | Falta de undo/histórico na edição de célula |
| HU4 | Consistência e padrões | Estilo visual consistente entre as duas páginas (Tailwind, mesmos padrões de modal/botão) | 0-1 | — |
| HU5 | Prevenção de erros | Validações pontuais existem (nome obrigatório, score 1-10); `date_of_birth` sem validação de formato no backend | 1 | Data de nascimento aceita qualquer string no servidor |
| HU6 | Reconhecimento em vez de memorização | Legenda de cores de severidade sempre visível ([EEMMForm.tsx:286-304](client/src/pages/EEMMForm.tsx:286)) | 0 | — |
| HU7 | Flexibilidade e eficiência de uso | Sem busca/filtro na lista de pacientes, sem atalhos além de Enter no modal de criação | 1 | Lista de pacientes sem busca em uso com muitos casos |
| HU8 | Estética e design minimalista | Layout limpo, Tailwind com bom espaçamento (avaliação por leitura de código, não visual) | — | — |
| HU9 | Ajudar a reconhecer/diagnosticar/recuperar de erros | Mensagens de erro genéricas em todo o backend: toda rota captura exceções e retorna `{error: "Internal server error"}` sem detalhe ([patients.ts:13,38,55,73](server/src/routes/patients.ts:13); [eemm.ts:69,137](server/src/routes/eemm.ts:69)) | 2 | Erro 500 não diferenciável pelo usuário nem pelo avaliador |
| HU10 | Ajuda e documentação | **Zero** ocorrências de conteúdo de ajuda/tooltip em todo `client/src` (grep confirmado) | 3 | Nenhum ponto de ajuda no uso — bloqueia diretamente a Tarefa T5 do roteiro (Bloco 6) |
| HC1 (inferida: fidelidade terminológica ao EEMM) | Ver Bloco 2/5 — nomenclatura de nível diverge do metamodelo pré-registrado | 3 | Risco de validade de construto do instrumento |
| HC2 (inferida: adequação da linguagem clínica) | "Severidade", "Notas Clínicas" — registro clínico razoável, sem linguagem estigmatizante identificada | 0-1 | — |
| **HC3 (dada: segurança clínica do output)** | **Não há nenhuma lógica de geração de texto na aplicação** — confirmado por busca (`formula`) e leitura de `eemm.ts`/`patients.ts`: nenhum endpoint compõe texto a partir dos dados. Logo, hoje **não há superfície de risco** para inferência causal automática, sugestão de conduta terapêutica não solicitada, ou linguagem de conclusão diagnóstica — porque não há geração de texto nenhuma. | N/A hoje | **Risco futuro, não atual**: no momento em que a Formulação Textual do objetivo 1(b) for implementada, HC3 passa a ser a heurística de maior risco do sistema. Recomenda-se, desde já, que a futura função de geração use apenas templates com dados brutos do usuário (nunca inferência de causalidade ou sugestão de conduta gerada automaticamente) — mas isso é orientação para trabalho futuro, não uma correção do código atual. |
| HC4 (inferida: transparência de dados/privacidade) | Nenhuma tela ou texto sobre armazenamento/retenção em toda a aplicação (ver Bloco 1 NF-e, Bloco 4, Bloco 6-T8) | 3 | Bloqueia diretamente a Tarefa T8 do roteiro |

---

## 6. Bloco 4 — Governança de dados (§4.10)

Cada afirmação do §4.10 verificada individualmente contra o código:

| Afirmação do §4.10 | Correspondência no código | Veredito |
|---|---|---|
| "Rotina programática de purga elimina integralmente os registros do caso criado ao término de cada sessão" | Não existe nenhum cron, timeout, hook de fim-de-sessão, `setInterval`, ou middleware de expiração em `server/src/`. A única forma de exclusão é `DELETE /api/patients/:id` ([patients.ts:59-75](server/src/routes/patients.ts:59)), disparada **manualmente pelo usuário clicando em "Excluir"** — confirmado ao vivo nesta auditoria (Tarefa T8). Não há nenhum disparo automático por fim de sessão. | **Sem correspondência — P0** |
| "A integridade da eliminação é verificada por consulta ao banco imediatamente após a execução" | O handler de exclusão executa `DELETE` e responde `204` sem nenhuma consulta de verificação subsequente ([patients.ts:70-71](server/src/routes/patients.ts:70)). Esta auditoria executou essa verificação **externamente** via script (`SELECT * FROM eemm_cells WHERE patient_id NOT IN (SELECT id FROM patients)` → 0 linhas órfãs) e confirmou que o `ON DELETE CASCADE` do schema ([database.ts:20](server/src/database.ts:20)) funciona corretamente — mas essa verificação **não existe no código do produto**, foi feita manualmente pelo auditor. | **Sem correspondência no código — mecanismo subjacente funciona, mas não é auto-verificado** |
| Separação física entre dados operacionais (SQLite embarcado) e dados de pesquisa (feedback dos avaliadores) | Não há tabela, arquivo ou qualquer estrutura de "dados de pesquisa/feedback de avaliadores" em lugar nenhum do schema — apenas `patients` e `eemm_cells` existem ([database.ts:9-28](server/src/database.ts:9)). A afirmação pressupõe um segundo canal de dados que ainda não foi construído; não há como verificar segregação de algo que não existe. | **Não verificável — a segunda classe de dados citada não existe no código** |
| "Sem exportação automática" | Parcialmente sustentável: `server/package.json` e `client/package.json` não listam nenhuma dependência de analytics, error-tracking ou webhook, e não há chamada HTTP de saída em nenhum arquivo. **Porém**: `server/database.sqlite`, `-shm`, `-wal` (e a cópia em `artifacts/api-server/`) estão versionados no Git e não estão no `.gitignore` (ver Bloco 0.6) — isso constitui uma forma de exportação/retenção permanente e não controlada de qualquer dado real inserido no banco, via histórico do controle de versão, independentemente de não existir exportação via rede. | **Parcialmente sustentável para a rede; sem correspondência para o controle de versão — P0** |

### Prioridade para a banca

As duas primeiras linhas (rotina de purga automática e verificação pós-purga) são afirmações causais específicas e demonstráveis ao vivo — um examinador pode pedir "mostre a rotina de purga rodando" e não há nada para mostrar. Classificar como **P0** (Bloco 8, tabela consolidada). O achado do banco versionado no Git é adicional a este bloco e igualmente P0, por contradizer diretamente o espírito de "sem exportação automática" com uma prova concreta e reproduzível (`git ls-files | grep sqlite`).

---

## 7. Bloco 5 — Arquitetura e justificativas técnicas (§4.6, §5.1)

**A afirmação a verificar:** TypeScript foi escolhido "por necessidade de integridade estrutural no manuseio dos múltiplos níveis e construtos interdependentes do EEMM", e "a estrutura de dados replica diretamente a arquitetura dimensão × nível × valência do metamodelo".

### 7.1 Onde está esse arquivo de tipos?

Se um examinador pedir "mostre o arquivo de tipos que replica a arquitetura do metamodelo", o arquivo mais próximo disso é [server/src/routes/eemm.ts:6-23](server/src/routes/eemm.ts:6):

```ts
const DIMENSIONS = ["cognition","affect","attention","self","behavior","motivation"] as const;
const LEVELS = ["biological","conditioning","cognitive_language","group_cultural"] as const;
type Dimension = (typeof DIMENSIONS)[number];
type Level = (typeof LEVELS)[number];
```

Isso é o que existe. Não é um arquivo de modelo dedicado (`shared/types/eemm.ts` ou equivalente) — está embutido dentro de um arquivo de rota. E, criticamente:

- **Não há `type Valence`.** A afirmação diz explicitamente "dimensão × nível × **valência**" — o terceiro eixo simplesmente não é modelado em tipo nenhum, em nenhum arquivo, porque não é modelado em dado nenhum (Bloco 1-e, Bloco 2).
- **Não é compartilhado com o frontend.** O diretório `shared/` na raiz do projeto está **vazio** (confirmado — zero arquivos). `client/src/pages/EEMMForm.tsx:18-32` **redeclara** seu próprio array `DIMENSIONS`/`LEVELS`, como `{key, label}[]` não tipado por união literal, sem importar `Dimension`/`Level` do backend. Backend e frontend mantêm duas fontes de verdade independentes para o mesmo domínio, sem checagem cruzada do compilador.
- **A prova de que isso já causou problema real, não hipotético:** é exatamente essa falta de fonte única que permitiu ao commit `336fe44` alterar `LEVELS` em `artifacts/eemm-client` para `variation/selection/retention` sem que nenhum erro de compilação, nenhum teste e nenhuma checagem de tipo cruzada acusasse a divergência com `server/client` (Bloco 0.1). Duas declarações literais desconectadas não se protegem uma à outra.

### 7.2 Modo strict

`client/tsconfig.json:11` e `server/tsconfig.json:6` têm `"strict": true` — isso **é verdade** e sustenta a metade da afirmação sobre "erros de tipo em tempo de compilação". Mas strict mode protege apenas o que está modelado em tipo; como a valência não está modelada, strict mode não oferece proteção nenhuma sobre o eixo que a própria afirmação cita como razão da escolha.

### 7.3 Veredito

A afirmação causal "TypeScript PORQUE preserva fidelidade clínica, pois a estrutura replica dimensão × nível × valência" é **factualmente insustentável no estado atual do código**: dois dos três eixos citados (nível, no sentido dos 3 níveis do critério; valência) não existem no sistema de tipos porque não existem no schema. O terceiro eixo (dimensão) existe, mas duplicado sem compartilhamento, o que já gerou drift real entre as duas cópias do repositório. Esta é a seção de **maior risco de defesa** do relatório: é uma frase que soa rigorosa e é diretamente falseável mostrando o arquivo pedido.

---

## 8. Bloco 6 — Roteiro de tarefas (Apêndice C, T1-T8)

Executado ao vivo nesta auditoria (servidor Express real em `:3001`, frontend Vite real em `:5173`, banco `server/database.sqlite`), não apenas por leitura estática de código.

| # | Tarefa | Executável hoje? | Ponto exato de quebra |
|---|---|---|---|
| T1 | Criar caso | **Sim** | Modal "+ Novo Paciente" → `POST /api/patients` → paciente aparece na lista. Testado com sucesso ("Caso Teste Auditoria" criado e listado). |
| T2 | Registrar afeto **adaptativo** em nível **psicológico** | **Quebra** | Ao abrir a célula Afeto na coluna candidata a "psicológico" (`Condicionamento` ou `Cognitivo/Linguagem` — a UI não rotula nenhuma coluna como "Psicológico"), o painel lateral abre com apenas um slider de severidade (0-10) e um campo de notas. **Não existe nenhum controle para marcar "adaptativo"** — nem toggle, nem radio, nem campo. |
| T3 | Registrar afeto **desadaptativo** em nível psicológico (mesma célula, valência oposta) | **Quebra** | Mesmo ponto de quebra de T2, agravado: mesmo que a UI tivesse um seletor de valência, o schema (`UNIQUE(patient_id, dimension, level)` em [database.ts:26](server/src/database.ts:26)) permite **apenas um registro** por combinação dimensão×nível — um segundo `PUT` para a mesma célula faz `ON CONFLICT ... DO UPDATE` ([eemm.ts:117-120](server/src/routes/eemm.ts:117)), **sobrescrevendo** o primeiro em vez de coexistir. Bivalência é estruturalmente impossível no schema atual, não apenas ausente na UI. |
| T4 | Registrar as 5 dimensões restantes nos 3 níveis | **Parcialmente executável, mas sobre uma matriz errada** | Tecnicamente qualquer uma das 24 células (6×4) aceita severidade + nota — testado com sucesso na célula Afeto×Condicionamento (score 7, nota salva, refletida no grid). Mas a tarefa pede "3 níveis"; a aplicação só oferece 4 níveis com nomes que não correspondem 1:1 aos 3 esperados (Bloco 2), então "os 3 níveis" não é uma operação bem definida na UI atual. |
| T5 | Consultar ajuda no ponto de uso | **Quebra — total ausência** | Nenhum ícone, botão, tooltip ou link de ajuda existe em `EEMMForm.tsx` ou `PatientList.tsx` (confirmado por leitura de código e por inspeção da árvore de acessibilidade da página renderizada). Não há onde clicar. |
| T6 | Editar registro anterior | **Sim** | Reabrir uma célula já preenchida carrega o valor salvo no slider/notas; alterar e salvar atualiza via `PUT` (upsert). Fluxo de edição funciona corretamente. |
| T7 | Gerar formulação final | **Quebra — rota inexistente** | Não existe botão nem rota para isso. Testado ao vivo: navegar para uma URL plausível (`/patients/1/formulation`) renderiza **página em branco** — sem 404, sem mensagem, porque `App.tsx` não tem rota-fallback (`*`). Não há, em lugar nenhum do frontend, um caminho de navegação que leve a essa funcionalidade, porque a funcionalidade em si não existe (Bloco 1-b). |
| T8 | Localizar info de armazenamento/eliminação e excluir caso | **"Localizar info" quebra; "excluir" funciona** | Não existe, em nenhuma tela, informação sobre onde os dados ficam armazenados ou por quanto tempo — não há o que "localizar". A exclusão em si funciona: modal de confirmação → `DELETE /api/patients/:id` → paciente removido da lista, e a auditoria confirmou por consulta direta ao banco que a cascata (`eemm_cells`) foi executada corretamente (0 linhas órfãs) — mas isso foi verificado pelo auditor externamente, não pela aplicação (ver Bloco 4). |

**Conclusão do Bloco 6:** de 8 tarefas, **3 executam sem quebra** (T1, T4-parcial, T6, e a metade "excluir" de T8) e **4 quebram em um ponto identificável e reproduzível** (T2, T3, T5, T7), com T8 quebrando parcialmente. Se este é o roteiro que os avaliadores especialistas vão executar na Atividade 5, ele quebra antes da metade — a coleta de dados de inspeção por heurísticas não é viável sobre a build atual sem que os avaliadores tropecem em funcionalidades inexistentes, o que contamina qualquer julgamento de severidade que dependa de completar a tarefa.

---

## 9. Bloco 7 — Infraestrutura (Repl.it)

O `.replit` na raiz confirma que o projeto **continua configurado para hospedagem Repl.it**:

- `[deployment] deploymentTarget = "autoscale"`, `router = "application"` — usa o serviço de deploy gerenciado do Replit.
- `[[artifacts]]` registra `artifacts/api-server` e `artifacts/mockup-sandbox` como artefatos publicáveis (não registra `artifacts/eemm-client` nem `server`/`client` diretamente — ver nota abaixo).
- `[workflows]` define os processos de desenvolvimento (`API Server` na porta 3001, `Frontend Cliente` na porta 5173) como tarefas `shell.exec` do Replit.
- `[postMerge] path = "scripts/post-merge.sh"` roda `pnpm install --frozen-lockfile && pnpm --filter db push` automaticamente após merge — outro processo gerenciado pela plataforma, fora do controle direto do código da aplicação.

**Nota que precisa entrar no texto do TCC antes de qualquer troca de hosting:** o artefato registrado para deploy (`artifacts/api-server`) é a cópia **divergente** descrita no Bloco 0.1/5 — a que tem `LEVELS = ["variation","selection","retention"]` em vez do esquema de níveis original. Se uma demonstração ao vivo ou uma coleta de dados usar o ambiente publicado pelo Replit em vez do ambiente de desenvolvimento local, os avaliadores verão uma matriz com colunas erradas (operadores evolucionários no lugar de níveis), diferente de tudo que foi analisado nos Blocos 2/5/6 desta auditoria. Isso precisa ser resolvido (convergindo as duas cópias ou eliminando uma) antes de qualquer coleta, independentemente da decisão sobre trocar de hosting.

Se a hospedagem for trocada, os seguintes pontos do §4.10 precisam ser reavaliados no texto (sem decidir aqui qual alternativa adotar):

- **Isolamento de instância**: hoje o SQLite é um arquivo local ao processo Repl.it; em outro provedor, a garantia de que o arquivo não é compartilhado entre instâncias/réplicas do autoscaling precisa ser reconfirmada para a plataforma escolhida.
- **Backup automático da plataforma**: Replit pode manter snapshots/checkpoints de deployment fora do controle do autor (o próprio histórico de commits já mostra `Replit-Commit-Checkpoint-Type: full_checkpoint` em metadados de commit) — qualquer alternativa precisa ter sua política de snapshot/backup auditada da mesma forma, porque isso é, na prática, mais um canal de retenção não controlado pela "rotina de purga" do §4.10.
- **Controle sobre variáveis de ambiente e segredos**: não há segredo/credencial no código hoje (sem auth, sem chave de API), mas se a troca de hosting introduzir autenticação ou variáveis de ambiente, a superfície de gestão de segredos da nova plataforma precisa entrar no §4.10.
- **`postMerge` (`scripts/post-merge.sh`)**: hoje referencia `pnpm --filter db push`, que pertence ao monorepo `lib/db` (Postgres/Drizzle) **não utilizado** pela aplicação real — outro artefato de configuração que precisa ser limpo ou justificado antes de qualquer texto final sobre a arquitetura de deploy.

---

## 10. Tabela consolidada de gaps

| Seção do documento | O que foi prometido | O que existe no código | Classificação | Urgência | Risco de defesa | Ação técnica concreta |
|---|---|---|---|---|---|---|
| §4.8.4 / Bloco 2 | Matriz EEMM 6×3 com ≥80% de conformidade | 0/18 células PF/PA; schema não tem eixo de valência nem de nível de 3 categorias | AUSENTE | **U1** | ALTO | Adicionar coluna `valence` à tabela `eemm_cells`; redefinir `LEVELS` para 3 valores fiéis a Hayes et al. (biofisiológico/psicológico/sociocultural); ajustar `UNIQUE` constraint para `(patient_id, dimension, level, valence)` |
| §4.5-e | Registro de bivalência adaptativa/desadaptativa | Nenhuma coluna, nenhum controle de UI | AUSENTE | **U1** | ALTO | Idem acima + campo de seleção adaptativo/desadaptativo no painel de célula ([EEMMForm.tsx](client/src/pages/EEMMForm.tsx)) |
| §4.10 | Rotina programática de purga ao fim de sessão | Só exclusão manual via clique do usuário ([patients.ts:59](server/src/routes/patients.ts:59)) | AUSENTE | **U1** | ALTO | Implementar job/hook de expiração (ex. `node-cron` ou verificação em cada request checando `created_at` vs. TTL de sessão) que chama a mesma rota de exclusão automaticamente |
| §4.10 | Verificação de integridade pós-purga por consulta ao banco | Handler de DELETE não consulta após excluir | AUSENTE | **U1** | ALTO | Adicionar `SELECT` de verificação (paciente + `eemm_cells` órfãs) logo após o `DELETE` em [patients.ts:70](server/src/routes/patients.ts:70), retornando confirmação explícita na resposta |
| §4.10 (achado adicional) | Implícito: "sem exportação automática" | `server/database.sqlite*` e `artifacts/api-server/database.sqlite*` versionados no Git, fora do `.gitignore`, já contendo dado de teste real | AUSENTE | **U1** | ALTO | Adicionar `*.sqlite*` ao `.gitignore`; remover os arquivos do histórico de versionamento (ex. `git rm --cached` + purga de histórico se necessário) |
| §4.6/§5.1 / Bloco 5 | "Estrutura de tipos replica dimensão × nível × valência" | Tipos cobrem só dimensão+nível, embutidos em arquivo de rota, não compartilhados com o frontend | PARCIAL | **U1** | ALTO | Criar `shared/eemm-types.ts` com `Dimension`, `Level` (3 valores), `Valence`; importar em `server` e `client` a partir da mesma fonte |
| Apêndice C / Bloco 6 | Roteiro T1-T8 executável pelos avaliadores | T2, T3, T5, T7 quebram; T8 quebra parcialmente | AUSENTE/PARCIAL | **U1** | ALTO | Corrigir bivalência (ver acima), adicionar rota/página de ajuda contextual, adicionar rota/página de formulação final, adicionar tela de informação de armazenamento |
| §4.5-b | Formulação textual gerada a partir dos dados | Nenhuma lógica de geração de texto existe | AUSENTE | **U2** | ALTO | Implementar `GET /api/patients/:id/formulation` que compõe texto template-based (sem inferência causal — ver HC3, Bloco 3) a partir das células preenchidas |
| §4.5-d | Referências aos processos de mudança por dimensão | Nenhum dado de referência no schema ou no frontend | AUSENTE | **U2** | ALTO | Criar `shared/processes.ts` com mapa dimensão→processos e exibir no painel lateral |
| §4.5-a | Fluxo guiado e sequencial pelas dimensões/níveis | Grid livre, sem stepper nem indicador de progresso | PARCIAL | **U2** | BAIXO | Adicionar componente de progresso e, opcionalmente, modo guiado passo-a-passo |
| §4.5-c (NF) | Validação estrutural além de tipagem | Validação ad hoc parcial; `date_of_birth`/`notes` sem checagem de formato | PARCIAL | **U2** | BAIXO | Adotar Zod (ou similar) nos dois pares de rotas, unificando `server` e `artifacts/api-server` |
| §4.5 (NF) | Interface responsiva | Zero breakpoints Tailwind em `EEMMForm.tsx`/`PatientList.tsx` | AUSENTE | **U2** | BAIXO | Adicionar classes responsivas (`sm:`/`md:`) e testar em viewport móvel |
| §4.5-e (NF) | Transparência de armazenamento/retenção (LGPD) | Nenhuma tela/texto no frontend | AUSENTE | **U2** | ALTO | Criar página `/privacidade` com local de armazenamento, retenção e forma de eliminação; linkar no modal de exclusão |
| Bloco 0 (achado estrutural) | Implícito: uma única fonte de verdade para o artefato | Duas implementações paralelas (`server`/`client` vs `artifacts/`) já divergentes de forma conceitualmente incorreta (Bloco 0.1) | AUSENTE | **U1** | ALTO | Decidir qual cópia é canônica, eliminar a outra ou automatizar a sincronização; corrigir a troca indevida nível↔operadores evolucionários em `artifacts/` |
| Tabela 2 / Bloco 3 (HU10) | Ajuda e documentação no ponto de uso | Zero conteúdo de ajuda em toda a aplicação | AUSENTE | **U2** | BAIXO | Adicionar tooltips/ícone de ajuda contextual em cada célula do grid |
| §4.10 | Segregação entre dados operacionais e dados de pesquisa/feedback | Tabela de dados de pesquisa/feedback não existe — afirmação não verificável | AUSENTE | **U2** | ALTO | Definir e implementar o schema de dados de pesquisa antes de reafirmar a segregação no texto, ou remover a afirmação até existir |
| §4.7 (infra, Bloco 7) | — | Deploy configurado em Repl.it, artefato de deploy divergente do artefato de desenvolvimento | PARCIAL | **U2** | BAIXO (já reconhecido no texto) | Convergir `artifacts/api-server` com `server/` antes de qualquer coleta via ambiente publicado |

---

## 11. Lista de trabalho pré-CEP/pré-registro OSF (somente U1 e U2)

Esta é a lista a resolver **antes** de qualquer submissão ao CEP ou pré-registro no OSF — o pré-registro trava o instrumento, e a matriz de conformidade do Bloco 2 não pode ser reescrita depois para "caber" no código que existir naquele momento.

### U1 — bloqueante, resolve antes de qualquer outra coisa

1. Adicionar campo de **valência** (adaptativo/desadaptativo) ao schema `eemm_cells` e ao painel de edição de célula — sem isso, o Bloco 2 permanece em 0% por construção.
2. Corrigir o **eixo de nível** para os 3 valores fiéis ao metamodelo pré-registrado (biofisiológico/psicológico/sociocultural), substituindo os 4 níveis atuais.
3. Implementar **rotina automática de purga** ao fim de sessão + **verificação pós-purga** por consulta ao banco, tornando verificável a afirmação do §4.10.
4. Remover `server/database.sqlite*` e `artifacts/api-server/database.sqlite*` do controle de versão e adicioná-los ao `.gitignore` — hoje contradiz "sem exportação automática" com uma prova reproduzível em um `git ls-files`.
5. Convergir (ou eliminar) a divergência entre `server/`+`client/` e `artifacts/api-server/`+`artifacts/eemm-client/` — hoje existem duas matrizes EEMM incompatíveis no mesmo repositório, e a registrada para deploy é a mais incorreta das duas.
6. Criar um arquivo de tipos compartilhado (`shared/`) para `Dimension`/`Level`/`Valence`, consumido por `server` e `client`, sustentando de fato a afirmação do §4.6/§5.1 sobre TypeScript.
7. Corrigir os pontos de quebra do roteiro T2, T3, T5 e T7 (bivalência, ajuda contextual, formulação final) — sem isso a Atividade 5 (inspeção por especialistas) não é executável como desenhada.

### U2 — resolver antes da coleta de dados real, mas não bloqueia o pré-registro em si

8. Implementar geração de formulação **textual** (com salvaguarda HC3: apenas composição template-based dos dados inseridos, sem inferência causal automática).
9. Implementar referências aos processos de mudança por dimensão.
10. Adicionar indicador de progresso e considerar fluxo guiado/sequencial pelas dimensões.
11. Adotar validação por schema (Zod ou equivalente) cobrindo `date_of_birth` e `notes`.
12. Adicionar responsividade real (breakpoints Tailwind) e testar em viewport móvel.
13. Criar tela de transparência de armazenamento/retenção (LGPD) e linkar no fluxo de exclusão.
14. Definir explicitamente (ou remover do texto) a afirmação sobre segregação entre dados operacionais e dados de pesquisa/feedback, hoje não verificável por ausência da segunda estrutura de dados.
15. Adicionar tooltips/ajuda contextual no grid (HU10).
