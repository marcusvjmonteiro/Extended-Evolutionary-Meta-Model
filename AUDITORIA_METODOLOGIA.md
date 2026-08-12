# Auditoria de Conformidade Metodológica (DSR/EEMM) — Rodada 2

**Data:** 2026-08-11
**Estado auditado:** working tree após os Sprints 1–4.
**Método:** leitura do código-fonte atual, consulta direta ao schema SQLite, e execução ao vivo da
aplicação (API em `:3001`, frontend Vite em `:5173`) com percurso completo do roteiro T1–T8.

> **Esta é a segunda rodada de auditoria.** A primeira, contra o estado pré-sprints, está preservada
> no histórico do Git em `git show 3212b95:AUDITORIA_METODOLOGIA.md`. O contraste entre as duas é
> evidência direta da iteração de design (Atividade 3) e vale ser citado como tal — inclusive porque
> a rodada 1 reprovou o critério a priori em todas as quatro sub-verificações.

> **Ressalva de rastreabilidade:** os Sprints 3 e 4 estão aplicados no diretório de trabalho mas
> **não commitados** no momento desta auditoria (HEAD = `7e2454b`). O estado auditado aqui não está,
> portanto, integralmente sob controle de versão.

> **Ressalva de método:** o documento do TCC não está no repositório. As citações de §4.5, §4.8.4,
> §4.10, §4.6/§5.1, Tabela 2, Tabela 4, Tabela 6 e Apêndices B/C são as reproduzidas no pedido de
> auditoria. Onde a definição exata de uma heurística não foi fornecida, isso é sinalizado em vez de
> inventado.

---

## 1. Sumário executivo

| Métrica | Rodada 1 | **Rodada 2 (atual)** |
|---|---|---|
| Taxa de conformidade da matriz EEMM | 0/18 (0%) | **18/18 (100%)** — todas PA, nenhuma PF |
| Critério ≥80% (≥15/18) | FALHA | **PASSA** |
| Nenhuma dimensão AU nos 3 níveis | FALHA | **PASSA** |
| 6 células do nível psicológico PF/PA | FALHA (0/6) | **PASSA (6/6)** |
| 4 operadores evolucionários presentes | FALHA | **FALHA** |
| **Veredito no critério a priori do §4.8.4** | **FALHA (4 de 4)** | **FALHA (1 de 4)** |
| Afirmações do §4.10 sem correspondência verificável | 4 de 4 | **1 de 4**, mais 1 parcial e 1 novo achado |

### Veredito, sem atenuação

**O artefato ainda FALHARIA no critério de conformidade estrutural declarado a priori na Seção
4.8.4** — mas por um motivo único, específico e nomeável: **os quatro operadores evolucionários
(variação, seleção, retenção, adequação ao contexto) não existem em nenhuma funcionalidade**, nem
por célula nem transversalmente. Busca por esses termos em `server/src`, `client/src` e `shared/`
retorna **zero ocorrências**.

Isso é materialmente diferente da reprovação da rodada 1. Lá, o artefato falhava nas quatro
sub-verificações porque o eixo de valência não existia e o eixo de níveis estava errado. Aqui, a
matriz estrutural (dimensão × nível × valência) está completa e fiel; falta o eixo dinâmico.

**Dois cuidados de redação que o autor precisa observar ao citar a taxa de 100%:**

1. **Nenhuma célula é PF.** Todas as 18 são PA (presente com adaptação). Escrever "100% de
   conformidade" sem o qualificador seria enganoso — a taxa combina PF+PA por definição do próprio
   critério, e aqui o componente PF é zero.
2. A justificativa de design que sustenta a classificação PA (Seção 3.2) é uma **coerência
   verificada a posteriori**, não uma decisão de projeto documentada a priori. Apresentá-la como
   escolha deliberada original seria reconstrução retrospectiva.

---

## 2. Bloco 0 — Inventário técnico

### 2.1 Implementação única

Ao contrário da rodada 1, existe agora **uma única implementação**. `artifacts/api-server` e
`artifacts/eemm-client` foram eliminados no Sprint 2 (snapshot na tag
`pre-sprint2-artifacts-snapshot`). Resta em `artifacts/` apenas `mockup-sandbox`, ferramenta de
preview do Replit não relacionada ao produto.

Árvore de fontes completa (17 arquivos):

```
server/src/    database.ts, index.ts
               routes/    eemm.ts, formulation.ts, patients.ts, processes.ts
               services/  formulation.ts, purge.ts
client/src/    App.tsx, index.css, main.tsx
               pages/     EEMMForm.tsx, Formulation.tsx, NotFound.tsx, PatientList.tsx
shared/        eemm-processes.ts, eemm-types.ts
```

### 2.2 Árvore de rotas (Express)

| Método | Rota completa | Arquivo:linha |
|---|---|---|
| GET | `/health` | [server/src/index.ts:17](server/src/index.ts:17) |
| GET | `/api/eemm/processes` | [server/src/routes/processes.ts:26](server/src/routes/processes.ts:26) |
| GET | `/api/patients` | [server/src/routes/patients.ts:7](server/src/routes/patients.ts:7) |
| POST | `/api/patients` | [server/src/routes/patients.ts:18](server/src/routes/patients.ts:18) |
| GET | `/api/patients/:id` | [server/src/routes/patients.ts:43](server/src/routes/patients.ts:43) |
| DELETE | `/api/patients/:id` | [server/src/routes/patients.ts:60](server/src/routes/patients.ts:60) |
| GET | `/api/patients/:id/eemm` | [server/src/routes/eemm.ts:29](server/src/routes/eemm.ts:29) |
| PUT | `/api/patients/:id/eemm` | [server/src/routes/eemm.ts:73](server/src/routes/eemm.ts:73) |
| GET | `/api/patients/:id/formulation` | [server/src/routes/formulation.ts:15](server/src/routes/formulation.ts:15) |

Em `NODE_ENV=production`, `index.ts:32-36` adiciona `express.static(client/dist)` e um fallback SPA.
Não há rotas de autenticação, exportação, ou feedback de avaliadores.

### 2.3 Schema SQLite (DDL real, extraída de `sqlite_master`)

```sql
CREATE TABLE patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    date_of_birth TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE eemm_cells (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id      INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    dimension       TEXT NOT NULL CHECK (dimension IN ('affect','cognition','attention','self','motivation','behavior')),
    level           TEXT NOT NULL CHECK (level IN ('biophysiological','psychological','sociocultural')),
    valence         TEXT NOT NULL CHECK (valence IN ('adaptive','maladaptive')),
    severity_score  INTEGER CHECK (severity_score IS NULL OR (severity_score BETWEEN 1 AND 10)),
    notes           TEXT,
    updated_at      TEXT DEFAULT (datetime('now')),
    UNIQUE(patient_id, dimension, level, valence)
);

CREATE INDEX idx_eemm_cells_patient_id ON eemm_cells(patient_id);

-- Criada pela migração do Sprint 1; ver achado crítico no Bloco 4
CREATE TABLE eemm_cells_legacy_backup(
  id INT, patient_id INT, dimension TEXT, level TEXT,
  severity_score INT, notes TEXT, updated_at TEXT
);
```

### 2.4 Componentes do fluxo de criação/edição

`client/src/App.tsx` declara 5 rotas (contra 3 na rodada 1):

| Rota | Componente |
|---|---|
| `/` | redirect → `/patients` |
| `/patients` | [PatientList.tsx](client/src/pages/PatientList.tsx) — listar, criar, excluir |
| `/patients/:id/eemm` | [EEMMForm.tsx](client/src/pages/EEMMForm.tsx) — grid 6×3, painel bivalente, ajuda contextual |
| `/patients/:id/formulation` | [Formulation.tsx](client/src/pages/Formulation.tsx) — **novo** |
| `*` | [NotFound.tsx](client/src/pages/NotFound.tsx) — **novo**, elimina a tela em branco da rodada 1 |

### 2.5 TypeScript strict

| Config | `strict` | Governa a aplicação? |
|---|---|---|
| [server/tsconfig.json:11](server/tsconfig.json:11) | **true** | sim |
| [client/tsconfig.json:14](client/tsconfig.json:14) | **true** | sim |
| `tsconfig.base.json` | **não declarado**; `strictFunctionTypes: false` | **não** — nem server nem client o estendem (verificado) |

`tsc --noEmit` retorna exit 0 nos dois pacotes.

### 2.6 Persistência

Inicializada em [server/src/database.ts:5-8](server/src/database.ts:5): `better-sqlite3`, arquivo em
`server/database.sqlite` (via `path.join(__dirname, "..", ...)`), `journal_mode = WAL`,
`foreign_keys = ON`. Migração explícita e idempotente do schema legado nas linhas 60–105.

**Arquivos `.sqlite` estão fora do controle de versão** (`git ls-files | grep sqlite` → vazio),
cobertos por `.gitignore:57-61`. Permanecem no histórico em commits anteriores a `7e2454b` — o
histórico não foi reescrito, por decisão deliberada registrada no Sprint 2.

---

## 3. Bloco 1 — Objetivos funcionais e não funcionais (§4.5)

### Funcionais

| # | Objetivo | Classificação | Evidência / o que falta |
|---|---|---|---|
| (a) | Guiar pelas dimensões/níveis de forma **estruturada e sequencial** | **PARCIAL** | Estruturado: sim, grid 6×3 ([EEMMForm.tsx](client/src/pages/EEMMForm.tsx)). Sequencial: **não** — as 18 células são clicáveis em qualquer ordem, sem stepper e **sem indicador de progresso** (grep por `progress`/`progresso` no frontend: zero). Falta: contador de completude (ex. `x/36 registros`) no cabeçalho de `EEMMForm.tsx`, alimentado por `cells.filter(c => c.severity_score !== null \|\| c.notes)`. |
| (b) | Formulação **textual E visual** | **IMPLEMENTADO** | Visual: grid bivalente com matiz=valência e saturação=escore. Textual: [server/src/services/formulation.ts](server/src/services/formulation.ts) + [Formulation.tsx](client/src/pages/Formulation.tsx). Verificado ao vivo (Bloco 6, T7). |
| (c) | Armazenamento, recuperação e edição durante a sessão | **IMPLEMENTADO** | CRUD completo; edição in-place verificada ao vivo (T6). |
| (d) | Referências aos **processos de mudança** por dimensão | **PARCIAL** | Existe: [shared/eemm-processes.ts](shared/eemm-processes.ts), 24 processos, servidos por `GET /api/eemm/processes`. **Mas indexado só por dimensão**, e o conteúdo é predominantemente de nível psicológico — numa célula biofisiológica ou sociocultural a ajuda exibe processos psicológicos. Falta: reindexar para `Record<Dimension, Record<Level, ChangeProcess[]>>` (18 listas em vez de 6). Além disso, **8 das 24 atribuições estão marcadas `// VERIFICAR`** e não foram conferidas contra a literatura fonte. |
| (e) | **Bivalência** adaptativa/desadaptativa | **IMPLEMENTADO** | Coluna `valence` com CHECK e `UNIQUE(patient_id, dimension, level, valence)`. Coexistência verificada ao vivo: ids 41 e 42 na mesma célula (Bloco 6, T2/T3). |

### Não funcionais

| # | Objetivo | Classificação | Evidência / o que falta |
|---|---|---|---|
| (a) | Acessível via navegador sem instalação | **IMPLEMENTADO** | SPA + API REST; verificado ao vivo. |
| (b) | Interface **responsiva** com terminologia EEMM em PT-BR | **PARCIAL** | Terminologia: correta e fiel. Responsividade: **zero breakpoints Tailwind** (`sm:`/`md:`/`lg:`/`xl:`) em todo `client/src` — grep confirma ausência total, idêntica à rodada 1. Falta: breakpoints em `EEMMForm.tsx` (tabela de 4 colunas) e `PatientList.tsx`, ou layout alternativo para viewport estreito. |
| (c) | **Integridade estrutural** (validação, não só tipagem) | **PARCIAL** | Melhorou substancialmente: validação de enum e faixa nas rotas (`status(400)` em 5 pontos) **e agora também no banco**, via CHECK constraints derivados dos próprios arrays compartilhados. Falta: `date_of_birth` e `notes` seguem sem validação de formato/tamanho; nenhuma biblioteca de schema (grep por zod/joi/yup/ajv: nenhuma). Falta: `zod` em `server/package.json` e schemas por rota substituindo as checagens manuais. |
| (d) | Manutenção em ambiente de baixo custo | **IMPLEMENTADO** | 3 dependências de produção no server, 5 no client. SQLite embarcado. |
| (e) | **Transparência** de armazenamento, retenção e eliminação (LGPD) | **AUSENTE** | Grep por `lgpd`, `armazenad`, `retenc`, `privacidade`, `4 horas`, `purga` em `client/src`: **zero ocorrências**. Verificado ao vivo (T8a): nenhuma tela menciona o assunto. **Agravante em relação à rodada 1:** agora existe uma política de retenção real (TTL de 4 h) que o usuário não tem como conhecer. Falta: página `/privacidade` + link no modal de exclusão e no cabeçalho, consumindo `CASE_TTL_SECONDS` de [purge.ts:33](server/src/services/purge.ts:33). |

---

## 4. Bloco 2 — Matriz de conformidade EEMM (§4.8.4)

### 4.1 Aplicação das regras de decisão

| Critério | Resultado global | Base factual |
|---|---|---|
| **A1** presença | ✓ nas 18 células | Grid 6×3 com 2 valências por célula; `GET .../eemm` devolve 36 entradas sempre completas |
| **A2** fidelidade terminológica | ✓ nos rótulos das 18 células | `biophysiological`/`psychological`/`sociocultural` e as 6 dimensões, declarados em [shared/eemm-types.ts](shared/eemm-types.ts) e exibidos como Biofisiológico/Psicológico/Sociocultural. Sem sinônimo de outra tradição |
| **A3** bivalência | ✓ nas 18 células | `UNIQUE(patient_id, dimension, level, valence)` — os dois registros coexistem por construção do schema |
| **A4** dinâmica evolucionária | ✗ nas 18 células | **Zero ocorrências** de variação/seleção/retenção/adequação ao contexto em todo o código |

### 4.2 Justificativa de design que sustenta a classificação PA

Como A4 falha em todas as células, **nenhuma célula pode ser PF**. A classificação PA exige
justificativa de design formulável; ela existe:

> O artefato implementa os eixos **estruturais** do EEMM (dimensão × nível × valência) e omite o
> eixo **dinâmico**. Os operadores evolucionários descrevem mudança ao longo de observações
> repetidas no tempo, ao passo que o artefato tem escopo de formulação transversal de sessão única.
> A decisão de governança de dados do Sprint 3 — TTL de 4 horas com purga automática — **precluda
> estruturalmente** o registro longitudinal: não é possível registrar retenção de um processo ao
> longo do tempo num sistema que elimina o caso após 4 horas. A omissão é, portanto, coerente com o
> modelo de retenção declarado, e não um descuido isolado.

**Honestidade sobre o status dessa justificativa:** ela é uma **coerência verificada a posteriori**.
O TTL foi introduzido por razões de governança (§4.10), não como escolha deliberada de excluir
acompanhamento longitudinal. As duas decisões são mutuamente consistentes, mas apresentá-las como
um projeto unificado original seria reconstrução retrospectiva. Se o texto do TCC afirmar que a
ausência dos operadores evolucionários foi decisão de escopo a priori, essa afirmação precisa estar
sustentada por registro anterior aos sprints — que não existe neste repositório.

### 4.3 Matriz 6×3 completa

Legenda de cada célula: `A1/A2/A3/A4 → classificação`

| Dimensão | Biofisiológico | Psicológico | Sociocultural |
|---|---|---|---|
| **Afeto** | ✓/✓*/✓/✗ → **PA** | ✓/✓/✓/✗ → **PA** | ✓/✓*/✓/✗ → **PA** |
| **Cognição** | ✓/✓*/✓/✗ → **PA** | ✓/✓/✓/✗ → **PA** | ✓/✓*/✓/✗ → **PA** |
| **Atenção** | ✓/✓*/✓/✗ → **PA** | ✓/✓/✓/✗ → **PA** | ✓/✓*/✓/✗ → **PA** |
| **Self** | ✓/✓*/✓/✗ → **PA** | ✓/✓/✓/✗ → **PA** | ✓/✓*/✓/✗ → **PA** |
| **Motivação** | ✓/✓*/✓/✗ → **PA** | ✓/✓/✓/✗ → **PA** | ✓/✓*/✓/✗ → **PA** |
| **Comportamento Manifesto** | ✓/✓*/✓/✗ → **PA** | ✓/✓/✓/✗ → **PA** | ✓/✓*/✓/✗ → **PA** |

`✓*` = **A2 passa no rótulo da célula, mas com ressalva de conteúdo de apoio.** Nas 12 células de
nível biofisiológico e sociocultural, a ajuda contextual exibe processos de mudança de nível
psicológico (Seção 3, objetivo 1d). O rótulo da célula está correto; o material de referência
associado a ela, não. Isso não rebaixa a classificação — A2 avalia o rótulo — mas é um defeito de
validade de conteúdo que os especialistas da Atividade 5 têm alta probabilidade de detectar.

### 4.4 Verificações do critério a priori

| Verificação | Resultado |
|---|---|
| Taxa (PF+PA)/18 ≥ 80% | **18/18 = 100% → PASSA** (com o qualificador: 0 PF, 18 PA) |
| Nenhuma dimensão AU nos 3 níveis | **PASSA** — não há nenhuma célula AU |
| As 6 células do nível psicológico são PF/PA | **PASSA** — 6/6 PA |
| Os 4 operadores evolucionários em ao menos uma funcionalidade, mesmo transversal | **FALHA** — zero ocorrências em todo o código |

**Veredito: o artefato FALHARIA no critério a priori do §4.8.4**, exclusivamente pela quarta
verificação. As outras três passam.

---

## 5. Bloco 3 — Heurísticas (Tabela 2)

**Ressalva:** o texto completo da Tabela 2 não foi fornecido. HU1–HU10 seguem o conjunto de Nielsen;
HC1, HC2 e HC4 são inferidas do contexto clínico; apenas HC3 foi definida explicitamente no pedido.
Se a Tabela 2 real nomear heurísticas diferentes, esta seção precisa ser reexecutada.

| # | Heurística | Evidência estrutural | Severidade provável | Lacuna residual |
|---|---|---|---|---|
| HU1 | Visibilidade do status | "Carregando...", "Salvando...", "✓ Salvo" | **1** | Sem indicador de completude do caso (x/36) |
| HU2 | Correspondência com o mundo real | Terminologia EEMM correta em PT-BR | **0–1** | — (era 2 na rodada 1) |
| HU3 | Controle e liberdade (undo) | Confirmação na exclusão | **2** | Autosave ao fechar o painel sobrescreve sem histórico nem desfazer ([EEMMForm.tsx](client/src/pages/EEMMForm.tsx), `closePanel`) |
| HU4 | Consistência e padrões | Padrões visuais consistentes entre as 4 páginas | **0–1** | — |
| HU5 | Prevenção de erros | Validação por enum/faixa na API **e CHECK no banco** | **1** | `date_of_birth` sem validação de formato |
| HU6 | Reconhecimento em vez de memorização | Legenda do grid + **definições operacionais de valência na ajuda** | **0** | — (melhoria do Sprint 4) |
| HU7 | Flexibilidade e eficiência | — | **1** | Sem busca/filtro na lista de pacientes |
| HU8 | Estética e design minimalista | Layout limpo (avaliação por leitura, não visual) | — | — |
| HU9 | Recuperação de erros | — | **2** | Todo erro de backend retorna `{"error":"Internal server error"}` genérico ([patients.ts](server/src/routes/patients.ts), [eemm.ts](server/src/routes/eemm.ts)) |
| HU10 | Ajuda e documentação | **Ajuda contextual no painel, nas duas seções, sem sair do fluxo** — verificado ao vivo (T5) | **1** | Conteúdo enviesado para nível psicológico nas 12 células não-psicológicas |
| HC1 | Fidelidade terminológica (inferida) | Rótulos fiéis; 8 atribuições de processos marcadas `VERIFICAR` | **2–3** | Validade de conteúdo do mapa de processos não conferida contra a fonte |
| HC2 | Adequação da linguagem clínica (inferida) | — | **2** | **"Severidade" aplicada a processo adaptativo** é semanticamente incoerente: o campo mede intensidade, não gravidade. Presente em `severity_score` (schema), no rótulo "Nível de Severidade" (UI) e nas sentenças da formulação ("processo adaptativo com severidade 2/10") |
| **HC3** | **Segurança clínica do output** | **Ver 5.1** | **0–1** | Risco residual delimitado e deliberado |
| HC4 | Transparência de dados (inferida) | — | **3** | Nenhuma tela sobre armazenamento/retenção, apesar de existir política real de 4 h |

### 5.1 HC3 — verificação detalhada do output da formulação

A formulação é composição template-based determinística em
[server/src/services/formulation.ts](server/src/services/formulation.ts). Não há LLM, não há
síntese, não há inferência. Verificação automatizada sobre o texto gerado no percurso ao vivo
(Bloco 6), excluindo o cabeçalho de aviso — cuja função é justamente **negar** essas categorias — e
as notas verbatim do avaliador:

| Categoria de risco | Termos testados | Resultado |
|---|---|---|
| Inferência causal | 15 (*leva a, causa, resulta em, por isso, explica, devido a, portanto, associado a, relacionado a, decorre*…) | **ausente** |
| Sugestão de conduta | 12 (*recomend-, sugere-se, deve-se, indica-se, intervenção, tratamento, técnica, próximo passo, trabalhar, abordar*) | **ausente** |
| Linguagem diagnóstica | 12 (*indica, sugere, compatível com, consistente com, transtorno, síndrome, quadro de, diagnóstic-, patolog-, sintoma*) | **ausente** |

Reforços estruturais: cada sentença descreve **uma única célula** e inicia com "Na dimensão de";
nenhuma inicia com pronome anafórico; as duas sentenças de uma mesma célula (adaptativa e
desadaptativa) aparecem justapostas **sem conectivo** — exatamente onde uma síntese inseriria "por
outro lado". O documento carrega cabeçalho de aviso não removível, renderizado em bloco âmbar com
peso visual proporcional à função de proteção.

**Risco residual, delimitado e deliberado:** as notas do avaliador são reproduzidas **verbatim**,
entre aspas, atribuídas a ele. Se o próprio profissional escrever uma inferência causal na nota, ela
aparecerá na formulação. Isso é escolha de design defensável — censurar ou reescrever a nota do
profissional seria violação maior do que reproduzi-la com atribuição explícita — mas deve constar no
texto do TCC, e não ser apresentado como se o sistema garantisse ausência total de inferência causal
no documento final.

---

## 6. Bloco 4 — Governança de dados (§4.10)

| Afirmação do §4.10 | Correspondência no código | Veredito |
|---|---|---|
| "Rotina programática de purga elimina integralmente os registros do caso criado **ao término de cada sessão**" | Existe rotina automática: [purge.ts](server/src/services/purge.ts) — `startPurgeScheduler()` roda passagem imediata no bootstrap e `setInterval` a cada 15 min, eliminando casos com mais de 4 h desde a criação. Verificado ao vivo. **Mas o disparo não é "término de sessão":** o sistema não tem autenticação nem sessão, e o mecanismo real é expiração por tempo desde a criação | **PARCIAL — mecanismo existe, redação do texto não corresponde** |
| "A integridade da eliminação é **verificada por consulta ao banco imediatamente após a execução**" | `deleteCaseAndVerify()` ([purge.ts:63](server/src/services/purge.ts:63)) executa o DELETE e em seguida consulta `patients` e `eemm_cells`, retornando o resultado. O `DELETE /api/patients/:id` responde 200 com `{"deleted":true,"verified":true,...,"remaining":{"patients":0,"eemm_cells":0}}` | **VERIFICÁVEL — demonstrável ao vivo** |
| Separação entre dados **operacionais** e dados de **pesquisa** (feedback dos avaliadores) | Não existe nenhuma tabela, rota ou estrutura de feedback de avaliadores. A segunda classe de dados citada não existe | **SEM CORRESPONDÊNCIA — P0** |
| "Sem exportação automática" | Nenhuma dependência de analytics/error-tracking (server: `better-sqlite3`, `cors`, `express`); nenhuma chamada de rede de saída; nenhuma escrita em disco (`fs`/`writeFile`/`appendFile`: zero); `.sqlite` fora do tracking. **Ressalvas:** (a) presença histórica em commits anteriores a `7e2454b`; (b) o achado 6.1 abaixo | **SUSTENTÁVEL COM RESSALVAS** |

### 6.1 ACHADO NOVO — P0: tabela de backup legado fora do alcance da purga

A migração do Sprint 1 criou `eemm_cells_legacy_backup` para preservar a linha do schema antigo.
**Essa tabela não é tocada por nenhuma rotina de purga** — `purge.ts` não a menciona (verificado por
grep), e `purgeExpiredCases()` opera exclusivamente sobre `patients`, cascateando para `eemm_cells`.

Conteúdo atual, confirmado por consulta direta **após** a exclusão completa do caso de teste no
percurso T8:

```
{ id: 1, patient_id: 1, dimension: 'cognition', level: 'biological',
  severity_score: 7, notes: 'Déficit leve', updated_at: '2026-03-24 01:28:12' }
```

Ou seja: com `patients` e `eemm_cells` zerados, **dado de aparência clínica com escore e nota
permanece no banco por tempo indefinido**, sem TTL, sem purga e sem verificação. No caso concreto a
linha é seed fictício, mas o mecanismo é geral: qualquer dado presente no schema antigo no momento
da migração está lá permanentemente.

Isso contradiz diretamente a afirmação de que "a purga elimina integralmente os registros do caso".
É a afirmação mais frágil de todo o §4.10 hoje, porque é falseável em **uma consulta**:
`SELECT * FROM eemm_cells_legacy_backup;`.

### 6.2 Contagem para o sumário executivo

Das 4 afirmações do §4.10: **1 plenamente verificável**, **1 parcial** (mecanismo existe, redação
incorreta), **1 sem correspondência** (segregação de dados de pesquisa), **1 sustentável com
ressalvas** — mais **1 achado novo P0** (backup legado).

---

## 7. Bloco 5 — Arquitetura e justificativas técnicas (§4.6, §5.1)

A afirmação a verificar: TypeScript foi escolhido porque "a estrutura de dados replica diretamente a
arquitetura dimensão × nível × valência do metamodelo".

**Este bloco mudou de veredito entre as duas rodadas.**

| Pergunta | Rodada 1 | **Rodada 2** |
|---|---|---|
| Qual arquivo mostrar a um examinador? | Não existia; havia arrays soltos dentro de um arquivo de rota | **[shared/eemm-types.ts](shared/eemm-types.ts)** |
| Os três eixos estão modelados em tipo? | Não — `Valence` inexistia | **Sim** — `Dimension`, `Level` e `Valence` como uniões literais derivadas de `as const` |
| Fonte única? | Não — backend e frontend redeclaravam | **Sim** — `LEVELS = [` é declarado em **exatamente um ponto** de todo o código (verificado por grep) |
| Consumido pelas duas pontas? | Não | **Sim** — alias `@shared/*` via `paths` no tsconfig + `resolve.alias` no Vite |
| `strict` ativo? | Sim nos dois | **Sim nos dois**, `tsc --noEmit` exit 0 |

**Veredito: a afirmação causal do §4.6/§5.1 passou a ter prova material.** Um examinador que peça
para ver "o arquivo de tipos que replica a arquitetura do metamodelo" recebe um arquivo real, e a
unicidade da declaração é demonstrável por busca.

Duas ressalvas menores:

1. O tipo modela dimensão × nível × valência, mas **não** o eixo evolucionário — coerente com o
   Bloco 2, e é onde a afirmação "replica a arquitetura do metamodelo" fica incompleta se o texto
   descrever o EEMM como incluindo os operadores evolucionários.
2. `tsconfig.base.json` — config órfã do monorepo — não declara `strict` e define
   `strictFunctionTypes: false`. **Não governa `server/` nem `client/`** (nenhum dos dois o estende,
   verificado), então não enfraquece a justificativa; mas convém saber que existe, caso um
   examinador abra o arquivo da raiz.

---

## 8. Bloco 6 — Roteiro de tarefas (Apêndice C, T1–T8)

Executado ao vivo: servidor Express real em `:3001`, Vite real em `:5173`, com confirmação por
consulta direta ao SQLite.

| # | Tarefa | Resultado | Evidência |
|---|---|---|---|
| **T1** | Criar caso | **Executa sem quebra** | "Auditoria Rodada 2" criado pelo modal e listado; rota `/patients/8/eemm` |
| **T2** | Afeto adaptativo em nível psicológico | **Executa sem quebra** | Painel "Afeto — Psicológico" com seções Adaptativo e Desadaptativo; gravou id 41 |
| **T3** | Afeto desadaptativo na **mesma célula** | **Executa sem quebra** | id 42 coexiste com id 41 — confirmado no banco |
| **T4** | 5 dimensões restantes nos 3 níveis | **Executa sem quebra** | 30 PUTs, 30 sucessos, 0 falhas; 32 células no total |
| **T5** | Consultar ajuda no ponto de uso | **Executa sem quebra** | Botão `?` nas duas seções; 4 processos exibidos em cada; **URL permanece `/patients/8/eemm`** — sem saída do fluxo |
| **T6** | Editar registro anterior | **Executa sem quebra** | Reabrir carregou 5/"adaptativo T2" e 8/"desadaptativo T3"; edição do adaptativo (5→2) atualizou in place (id 41), desadaptativo intacto |
| **T7** | Gerar formulação final | **Executa sem quebra** | 6 blocos, 6 dimensões avaliadas, 32 registros; cabeçalho de aviso presente; varredura HC3 sem ocorrências |
| **T8** | Localizar info de armazenamento/eliminação **e** excluir caso | **PARCIAL** | **Primeira metade quebra:** nenhuma tela menciona armazenamento, retenção, privacidade ou o TTL de 4 h — não há o que localizar. **Segunda metade executa:** exclusão pelo modal removeu o caso; log do servidor registrou `caso id=8 eliminado e verificado: patients=0, eemm_cells=0 (32 celulas removidas em cascata)` |

Verificações complementares: rota `*` funciona (`/rota/inexistente` renderiza "404 — Página não
encontrada" em vez de tela em branco); console do navegador sem erros.

**Conclusão:** 7 das 8 tarefas executam integralmente; T8 executa pela metade. Na rodada 1, quatro
tarefas quebravam por completo (T2, T3, T5, T7) e T8 era parcial. **O roteiro é hoje percorrível de
ponta a ponta sem travamento**, o que não era verdade antes dos sprints — condição necessária para
que a Atividade 5 produza dados de inspeção interpretáveis.

---

## 9. Bloco 7 — Infraestrutura (Repl.it)

O projeto **continua configurado para Repl.it**:

- `[deployment] deploymentTarget = "autoscale"` com `build` e `run` apontando para `server/` e
  `client/` (reconfigurado no Sprint 2; as entradas `[[artifacts]]` foram removidas)
- `[workflows]` executa `cd server && npm run dev` (porta 3001) e `cd client && npm run dev`
  (porta 5173)
- `[postMerge]` roda `scripts/post-merge.sh`
- `artifacts/mockup-sandbox/` permanece em disco (ferramenta de preview do Replit, não é o artefato)

**Limitação relevante:** a configuração de deploy **não foi validada em execução** — não há ambiente
Replit disponível para exercitá-la. O que foi verificado é o comportamento de desenvolvimento. Uma
publicação de teste é necessária antes de qualquer demonstração à banca ou coleta com avaliadores.

Se a hospedagem for trocada, precisam ser reavaliados no texto do §4.10:

- **Isolamento de instância** — hoje o SQLite é arquivo local ao processo; num alvo com autoscaling
  ou múltiplas réplicas, a garantia de banco único e não compartilhado precisa ser reconfirmada, sob
  pena de a purga operar sobre uma réplica e não sobre outra
- **Backup automático da plataforma** — o Replit mantém checkpoints de deployment fora do controle do
  autor (visível nos metadados `Replit-Commit-Checkpoint-Type: full_checkpoint` do histórico). É, na
  prática, mais um canal de retenção que a rotina de purga não alcança. Qualquer alternativa precisa
  ter sua política de snapshot auditada da mesma forma
- **Gestão de segredos** — não há credencial no código hoje (sem auth); se a troca introduzir
  autenticação ou variáveis de ambiente, a superfície de segredos da nova plataforma entra no §4.10
- **Variáveis de configuração da purga** — `CASE_TTL_SECONDS` e `PURGE_INTERVAL_SECONDS` são
  sobrescrevíveis por ambiente. Numa plataforma onde terceiros possam definir variáveis de ambiente,
  isso é uma superfície de alteração da política de retenção que precisa ser considerada

---

## 10. Tabela consolidada de gaps

| Seção | O que foi prometido | O que existe no código | Classificação | Urgência | Risco de defesa | Ação técnica |
|---|---|---|---|---|---|---|
| §4.8.4 | 4 operadores evolucionários em ao menos uma funcionalidade | Zero ocorrências em todo o código | AUSENTE | **U1** | **ALTO** | Ou implementar registro transversal dos operadores (novo campo/tabela), ou declarar a exclusão como decisão de escopo explícita no texto e ajustar o critério a priori **antes** do pré-registro |
| §4.10 | "Purga elimina integralmente os registros do caso" | `eemm_cells_legacy_backup` retém dado clínico indefinidamente, fora do alcance da purga | AUSENTE | **U1** | **ALTO** | Incluir a tabela na rotina de purga, ou eliminá-la após conferência, ou dar-lhe TTL próprio em [purge.ts](server/src/services/purge.ts) |
| §4.10 | "Purga ao término de cada sessão" | Purga por TTL de 4 h desde a criação; sistema não tem sessão | PARCIAL | **U1** | **ALTO** | Corrigir a redação do §4.10 (texto substituto pronto em SPRINT_3_LOG.md §5.2) |
| §4.10 | Segregação entre dados operacionais e de pesquisa | Estrutura de feedback dos avaliadores não existe | AUSENTE | **U1** | **ALTO** | Definir e implementar o schema de dados de pesquisa, ou remover a afirmação até que exista |
| §4.5-e (NF) | Transparência de armazenamento/retenção (LGPD) | Zero menção na UI, apesar de política real de 4 h | AUSENTE | **U1** | **ALTO** | Página `/privacidade` + link no modal de exclusão; completa a metade faltante de T8 |
| §4.5-d | Referências aos processos de mudança | Mapa indexado só por dimensão; conteúdo de nível psicológico exibido em células biofisiológicas/socioculturais | PARCIAL | **U1** | **ALTO** | Reindexar para `Record<Dimension, Record<Level, ChangeProcess[]>>` em [shared/eemm-processes.ts](shared/eemm-processes.ts) |
| §4.5-d | Terminologia EEMM fiel nos processos | 8 de 24 atribuições marcadas `// VERIFICAR`, não conferidas | PARCIAL | **U1** | **ALTO** | Revisão por leitura direta de Hayes et al. (2020, 2022); lista em SPRINT_4_LOG.md §1.1 |
| Tabela 2 (HC2) | Linguagem clínica adequada | "Severidade" aplicada a processo adaptativo (schema, UI e formulação) | PARCIAL | **U2** | MÉDIO | Renomear para intensidade/grau de presença, com migração de coluna |
| §4.5-a | Fluxo estruturado **e sequencial** | Grid livre, sem stepper nem indicador de progresso | PARCIAL | **U2** | BAIXO | Contador `x/36` no cabeçalho de `EEMMForm.tsx` |
| §4.5-b (NF) | Interface responsiva | Zero breakpoints Tailwind | AUSENTE | **U2** | BAIXO | Breakpoints em `EEMMForm.tsx` e `PatientList.tsx` |
| §4.5-c (NF) | Validação estrutural | Manual nas rotas + CHECK no banco; `date_of_birth`/`notes` sem validação | PARCIAL | **U2** | BAIXO | Adotar `zod` por rota |
| Tabela 2 (HU9) | Recuperação de erros | Todo erro retorna "Internal server error" genérico | PARCIAL | **U2** | BAIXO | Diferenciar erros por tipo nas rotas |
| Tabela 2 (HU3) | Controle e liberdade (undo) | Autosave sobrescreve sem histórico | PARCIAL | **U2** | BAIXO | Confirmação ou histórico por célula |
| Tabela 2 (HU7) | Flexibilidade de uso | Sem busca/filtro na lista | PARCIAL | **U3** | BAIXO | Campo de busca em `PatientList.tsx` |
| §4.10 | `.sqlite` fora de qualquer canal de exportação | Fora do tracking atual; presentes em commits anteriores a `7e2454b` | PARCIAL | **U3** | MÉDIO | Declarar como limitação; reescrita de histórico exige decisão à parte |
| §4.7 | Infraestrutura adequada | Deploy reconfigurado para o par canônico, **não validado em execução** | PARCIAL | **U2** | MÉDIO | Publicação de teste no Replit antes de qualquer demonstração |
| — | Rastreabilidade de versão | Sprints 3 e 4 aplicados mas **não commitados** | PARCIAL | **U2** | MÉDIO | Commitar antes de qualquer congelamento de instrumento |
| — | Limpeza de repositório | `lib/` órfão (Drizzle/Postgres não consumido), `artifacts/mockup-sandbox` | PARCIAL | **U3** | BAIXO | Remover após confirmação; limpar `references` em `tsconfig.json` e `packages` em `pnpm-workspace.yaml` |

---

## 11. Lista priorizada — U1 e U2 (trabalho antes do CEP / pré-registro OSF)

O pré-registro trava o instrumento e a matriz de conformidade não pode ser reescrita depois para
"caber" no código. Estes são os itens a resolver antes disso.

### U1 — bloqueantes

1. **Decidir o destino dos operadores evolucionários.** É o único motivo de reprovação no critério
   a priori. Duas saídas legítimas: implementar o registro (variação/seleção/retenção/adequação ao
   contexto) ou **declarar a exclusão como decisão de escopo no texto e ajustar o critério antes do
   pré-registro**. A segunda é aceitável em DSR; o que não é aceitável é pré-registrar um critério
   que o artefato reprova e depois reinterpretá-lo.
2. **Purgar ou eliminar `eemm_cells_legacy_backup`.** Hoje falseia a afirmação central do §4.10 em
   uma única consulta SQL.
3. **Corrigir a redação do §4.10** sobre "término de sessão" — o sistema não tem sessão, e a
   afirmação atual não é defensável sob questionamento.
4. **Resolver a afirmação sobre segregação de dados operacionais vs. de pesquisa** — implementar a
   estrutura ou retirar a afirmação.
5. **Criar a tela de transparência de armazenamento/retenção (LGPD)** — fecha a metade faltante de
   T8 e é a única tarefa do roteiro ainda quebrada.
6. **Reindexar o mapa de processos de mudança por dimensão × nível** — validade de conteúdo, será
   lida por especialistas.
7. **Revisar as 8 atribuições marcadas `VERIFICAR`** contra a literatura fonte.

### U2 — antes da coleta, não bloqueiam o pré-registro

8. Renomear `severity_score`/"Severidade" para intensidade — incoerência semântica em processo
   adaptativo (HC2).
9. Indicador de progresso (x/36) no cabeçalho da matriz.
10. Responsividade real (breakpoints Tailwind) e teste em viewport móvel.
11. Validação por schema (`zod`) cobrindo `date_of_birth` e `notes`.
12. Diferenciação de erros de backend (HU9).
13. Undo ou histórico por célula (HU3).
14. Validar o deploy no Replit em publicação de teste.
15. Commitar os Sprints 3 e 4.

---

## 12. Comparativo entre as duas rodadas — para a Atividade 3

| Dimensão de avaliação | Rodada 1 | Rodada 2 |
|---|---|---|
| Implementações do artefato no repositório | 2, divergentes e incompatíveis | 1 |
| Eixo de níveis | 4 níveis, nomenclatura de outra tradição | 3 níveis fiéis ao metamodelo |
| Bivalência | estruturalmente impossível (constraint sobrescrevia) | schema-enforced, verificada ao vivo |
| Declarações de `LEVELS` no código | 4 pontos independentes | 1 |
| Tarefas do Apêndice C que quebram | 4 completas + 1 parcial | 0 completas + 1 parcial |
| Afirmações do §4.10 verificáveis | 0 de 4 | 1 plena, 1 parcial, 1 com ressalvas |
| §4.6/§5.1 (justificativa do TypeScript) | falseável | com prova material |
| Sub-verificações reprovadas no §4.8.4 | 4 de 4 | 1 de 4 |

O ponto metodologicamente interessante para o texto: **a rodada 1 reprovou, e a reprovação foi
registrada em vez de mascarada** (commit `3212b95`). A trajetória documentada de diagnóstico →
correção → rediagnóstico é o próprio ciclo de DSR, e é mais defensável perante uma banca do que um
artefato que aparenta nunca ter tido o problema.
