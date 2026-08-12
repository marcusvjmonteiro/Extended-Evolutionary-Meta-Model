# SPRINT 5 — Correção estrutural da matriz: sistema × operador evolucionário

**Data:** 12 de agosto de 2026
**Escopo:** substituição da matriz dimensão × nível (6 × 3 = 18 células) pela estrutura
sistema × operador evolucionário (8 × 4 = 32 células, bivalentes → 64 registros), conforme
Hayes et al. (2020, *Clinical Psychology Review*), Figura 1 — referência primária citada no
§4.8.4 do TCC.

**Pré-requisito verificado:** Sprints 1–4 confirmados em disco antes de qualquer alteração
(`shared/eemm-types.ts`, `server/src/database.ts`, `server/src/services/purge.ts`,
`shared/eemm-processes.ts` todos presentes).

---

## 1. Mudança teórica que fundamenta o sprint

A leitura anterior do repositório tratava o EEMM como matriz **dimensão × nível**, cruzando as
seis dimensões da experiência com três níveis de análise. Essa leitura estava errada. Contra a
Figura 1 da fonte primária:

- Os **oito sistemas** formam **um único eixo, não cruzado**. As seis dimensões da experiência
  (afeto, cognição, atenção, self, motivação, comportamento manifesto) e os dois níveis
  adicionais de análise (biofisiológico, sociocultural) são, todos os oito, **linhas irmãs do
  mesmo eixo**. Biofisiológico e sociocultural **não** são subdivididos pelas seis dimensões.
- Os **quatro operadores evolucionários** (variação, seleção, retenção, adequação ao contexto)
  formam o segundo eixo, como **categorias de conteúdo próprias** — não como atributo
  transversal verificado à parte.
- A **valência** (adaptativo/desadaptativo) permanece como **par de registros paralelos por
  célula**, exatamente como implementado no Sprint 1. Não mudou.

**Não foi implementado nenhum mecanismo de rastreio de mudança ao longo do tempo.** Os
operadores evolucionários são **caracterização clínica qualitativa** feita pelo profissional
dentro de uma única sessão de formulação (ex.: *"este padrão de evitação vem sendo retido há
anos por alívio imediato de ansiedade"*), não telemetria do aplicativo. Não há histórico de
sessões, comparação longitudinal, nem qualquer estrutura que os pressuponha.

Consequência colateral registrada: o valor `level = "psychological"` **desaparece do sistema**.
Não vira um nono sistema — as seis dimensões da experiência já *são* o nível psicológico na
leitura correta. É por isso que a migração não tem mapeamento automático (ver §3).

---

## 2. Schema — antes e depois

### Antes (Sprint 1, dimensão × nível bivalente)

```sql
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
```
Teto de registros por caso: 6 × 3 × 2 = **36**.

### Depois (Sprint 5, sistema × operador bivalente)

```sql
CREATE TABLE eemm_cells (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id      INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  system          TEXT NOT NULL CHECK (system IN ('affect','cognition','attention','self','motivation','behavior','biophysiological','sociocultural')),
  operator        TEXT NOT NULL CHECK (operator IN ('variation','selection','retention','context')),
  valence         TEXT NOT NULL CHECK (valence IN ('adaptive','maladaptive')),
  severity_score  INTEGER CHECK (severity_score IS NULL OR (severity_score BETWEEN 1 AND 10)),
  notes           TEXT,
  updated_at      TEXT DEFAULT (datetime('now')),
  UNIQUE(patient_id, system, operator, valence)
);
CREATE INDEX idx_eemm_cells_patient_id ON eemm_cells(patient_id);
```
Teto de registros por caso: 8 × 4 × 2 = **64**. Confirmado ao vivo (§6.1).

Os literais dos três CHECK continuam gerados a partir das constantes de
`shared/eemm-types.ts`, não digitados à mão — o banco não aceita valor que o sistema de tipos
não reconheça.

### O campo `notes` e o atributo A4

`notes` passa a ter função teórica específica: é onde o **atributo A4 (qualificação
processual, §4.8.4 corrigido)** se satisfaz — a caracterização qualitativa de *como* aquele
operador se manifesta naquele sistema. Não foi criado campo adicional; um segundo campo de
texto livre ao lado deste produziria ambiguidade sobre o que vai em qual. A função é tornada
explícita **na UI** (rótulo "Caracterização processual — [operador]" + texto de apoio), não
deixada implícita — é o que torna A4 verificável na prática, e não apenas presente em teoria.

---

## 3. Migração executada

Disciplina idêntica à do Sprint 1:

1. **Detecção:** ausência da coluna `system` = schema antigo.
2. **Backup:** se houvesse linhas, cópia para `eemm_cells_legacy_backup_v2` — nome **distinto**
   de `eemm_cells_legacy_backup`, porque essa é o achado P0 pendente (§4).
3. **Recriação vazia:** sem mapeamento automático de `dimension`+`level` → `system`.
4. **Índice** em `(patient_id)` mantido.

**Por que não há mapeamento automático.** Não existe correspondência segura. `level =
'psychological'` não tem destino no eixo novo, e mapear `dimension → system` descartando o
nível inventaria a informação de a qual sistema um registro de nível biofisiológico ou
sociocultural pertenceria. Como os registros existentes são fictícios, de teste, isso é
aceitável — e é a mesma decisão, pelo mesmo motivo, tomada no Sprint 1.

**Resultado ao vivo:**
```
[migração] eemm_cells: schema dimensão×nível substituído pelo schema sistema×operador
           (8×4, bivalente). 0 linha(s) preservada(s) em eemm_cells_legacy_backup_v2;
           tabela nova iniciada vazia.
```
`eemm_cells` tinha **0 linhas** no momento da migração, então `eemm_cells_legacy_backup_v2`
**não chegou a ser criada** — o `CREATE`/`INSERT` só roda com `count > 0`. O caminho de purga
dessa tabela foi exercitado à parte, com a tabela semeada à mão (§6.4).

---

## 4. Achado P0 resolvido — `eemm_cells_legacy_backup`

### Conteúdo encontrado antes da eliminação

```
id=1, patient_id=1, dimension="cognition", level="biological",
severity_score=7, notes="Déficit leve", updated_at="2026-03-24 01:28:12"
```

Uma linha. Confirma integralmente o diagnóstico da auditoria:

- `level = "biological"` é valor de um schema de **quatro** níveis que já não existe em lugar
  nenhum do repositório — nem sequer é `"biophysiological"`. Resíduo de **duas** migrações
  atrás.
- `patient_id = 1` referencia paciente há muito eliminado — a linha é órfã.
- Carrega nota de **aparência clínica** (`"Déficit leve"`).
- Estava **fora do alcance de `purge.ts`**, que varre `patients` e `eemm_cells` e nada mais.

Ou seja: dado de aparência clínica retido indefinidamente, contradizendo diretamente a
afirmação do §4.10 sobre eliminação integral dos registros.

### Ação: `DROP TABLE`

```
[migração] eemm_cells_legacy_backup ELIMINADA (1 linha(s) removida(s)) — resíduo do
           schema de 4 níveis, sem cobertura de purga. Achado P0 da auditoria resolvido.
```

A rastreabilidade da migração do Sprint 1 já está registrada em `SPRINT_1_LOG.md` e nas duas
rodadas de auditoria. Preservar o dado dentro do banco de produção não acrescenta rastro algum
e é, ele mesmo, o problema. O `DROP` roda **fora** da transação de migração, de propósito: é
correção de governança de dados independente do estado do schema, e precisa acontecer inclusive
quando o schema já está atualizado.

Confirmado por consulta direta ao banco: a tabela **não existe** (§6.4).

### Cobertura de purga para `eemm_cells_legacy_backup_v2`

Para que este sprint não recrie o problema que está corrigindo, a tabela v2 entrou em
`purge.ts` com **dois** caminhos, ambos sob o mesmo `CASE_TTL_SECONDS`:

1. **Por caso** — `deleteCaseAndVerify()` faz `DELETE` explícito das linhas da v2 com aquele
   `patient_id`. Explícito porque a tabela é cópia crua do schema antigo, sem FK: o
   `ON DELETE CASCADE` não a alcança. A contagem restante entra na `PurgeVerification` e na
   resposta HTTP do `DELETE /api/patients/:id`.
2. **Órfãos** — `purgeOrphanLegacyBackupRows()` remove linhas cujo `patient_id` já não existe
   em `patients`, a cada varredura. Sem isso a cobertura teria um buraco exatamente do tamanho
   do achado P0: uma linha de backup cujo paciente sumiu por outra via nunca mais teria evento
   que a eliminasse. Um backup órfão já é, por definição, dado retido além do TTL do caso a que
   pertencia.

As duas funções checam a existência da tabela antes de tocá-la — hoje ela não existe, e isso
não quebra nada.

---

## 5. Mapa de processos de mudança — reindexação por sistema

### O problema que isto resolve

A auditoria já havia identificado, antes mesmo desta correção estrutural: com a leitura
anterior, as **12 células de nível biofisiológico/sociocultural** exibiam, na ajuda contextual,
processos de mudança **de nível psicológico** — porque não existia conteúdo próprio para esses
níveis. O mapa indexava só por dimensão.

Com a estrutura corrigida, biofisiológico e sociocultural são **sistemas próprios**, com a
mesma hierarquia dos seis sistemas dimensionais. Ganharam listas de processos **próprias**, não
emprestadas. Confirmado ao vivo (§6.2).

### Contagem final de itens `VERIFICAR`

**17 de 32 processos** (antes: 9 de 24 no código — ver ressalva abaixo).

| Sistema | VERIFICAR / total |
|---|---|
| Afeto | 2 / 4 |
| Cognição | 2 / 4 |
| Atenção | 1 / 4 |
| Self | 1 / 4 |
| Motivação | 2 / 4 |
| Comportamento Manifesto | 1 / 4 |
| **Biofisiológico** | **4 / 4** |
| **Sociocultural** | **4 / 4** |
| **Total** | **17 / 32** |

**Isto não é regressão.** É o sprint expondo trabalho de revisão bibliográfica que precisa ser
feito antes da coleta real, e que a estrutura anterior escondia ao reciclar processos
psicológicos onde não cabiam. Conteúdo explicitamente marcado como não verificado é melhor do
que conteúdo que pareça definitivo sem ser.

**Ressalva de contagem.** O `SPRINT_4_LOG.md` afirma "8 de 24" e sua tabela lista 8 itens, mas
o código do Sprint 4 já continha **9** marcadores `// VERIFICAR:` — *Repertório de habilidades*
(comportamento manifesto) estava marcado no código e foi contado, no texto daquele log, entre
os "16 restantes". O número correto de partida é **9 de 24**; a diferença é erro de contagem do
log anterior, não alteração feita neste sprint.

### Lista completa para revisão manual contra Hayes et al. (2020, 2022)

**Herdados do Sprint 4 (9)** — dúvida de atribuição a **sistema**:

| # | Processo | Sistema atribuído | Dúvida |
|---|---|---|---|
| 1 | Supressão emocional | Afeto | Parte da literatura a trata como subtipo de evitação experiencial, não como processo distinto |
| 2 | Consciência emocional | Afeto | Fronteira com atenção (atenção dirigida ao estado interno) |
| 3 | Ruminação / preocupação perseverativa | Cognição | Pode ser atenção (perseveração atencional) |
| 4 | Comportamento governado por regras | Cognição | *Pliance* tem componente social forte; poderia ser motivação ou sociocultural |
| 5 | Hipervigilância | Atenção | Fronteira com afeto (ativação relacionada à ameaça) |
| 6 | Autocrítica | Self | Poderia ser cognição (conteúdo avaliativo) |
| 7 | Hierarquização de objetivos | Motivação | Enquadramento relacional hierárquico; poderia ser cognição |
| 8 | Rigidez motivacional | Motivação | Sobreposição com rigidez comportamental |
| 9 | Repertório de habilidades | Comportamento Manifesto | Literatura o trata ora como processo, ora como resultado de outros processos |

**Novos neste sprint (8)** — sem base de atribuição prévia no repositório; **todos** marcados:

| # | Processo | Sistema | Dúvida específica |
|---|---|---|---|
| 10 | Regulação autonômica | Biofisiológico | Confirmar se a fonte a trata como processo de mudança do sistema ou como *medida* (índice fisiológico) de flexibilidade atribuída a outro sistema |
| 11 | Reatividade de estresse fisiológico | Biofisiológico | Confirmar terminologia da fonte (resposta de estresse / carga alostática / reatividade do eixo HPA são tratadas de modos distintos) e se a polaridade desadaptativa se sustenta |
| 12 | Regulação do ritmo circadiano e do sono | Biofisiológico | Confirmar se a fonte trata sono como processo biofisiológico próprio ou como comportamento manifesto (higiene de sono) |
| 13 | Interocepção | Biofisiológico | Fronteira explícita com atenção (direcionamento ao corpo) e afeto (consciência emocional) |
| 14 | Suporte social | Sociocultural | Confirmar se a fonte distingue suporte *disponível* de suporte *percebido* (que teria componente cognitivo) e qual dos dois é o processo |
| 15 | Normas de grupo | Sociocultural | Sobreposição direta com "comportamento governado por regras"; confirmar se a fonte separa a norma como contingência sociocultural do controle verbal que ela exerce |
| 16 | Estigma e estigma internalizado | Sociocultural | Estigma público é sociocultural, mas o internalizado se sobrepõe a self conceitualizado; confirmar se são um processo ou dois |
| 17 | Papéis socioculturais | Sociocultural | Confirmar se figura como processo de mudança na fonte ou apenas como descritor de contexto — só o primeiro caberia nesta lista |

A marcação sinaliza onde a dúvida é **maior**, não onde ela é **exclusiva**: a revisão vale
para os 32.

---

## 6. Verificação ao vivo

Executada com backend em `:3001` (ts-node) e Vite em `:5173`, aplicação rodando.
Typecheck limpo em ambos os pacotes (`tsc --noEmit`, exit 0).

### 6.1 Estrutura da matriz e coexistência de valências

- `GET /api/patients/:id/eemm` retornou **64 registros**, 8 sistemas distintos × 4 operadores
  distintos × 2 valências. Primeiro: `affect × variation × adaptive`. Último:
  `sociocultural × context × maladaptive`.
- **Coexistência (não sobrescrita)** no MESMO sistema × operador — `behavior × retention`:
  - `maladaptive`, severidade 8 — *"Padrao de evitacao de situacoes sociais vem sendo retido ha
    anos pelo alivio imediato de ansiedade que produz."*
  - `adaptive`, severidade 4 — *"Rotina de caminhada matinal se mantem estavel ha oito meses,
    sustentada pelo contato com o grupo do parque."*
  - Consulta posterior: **as duas linhas presentes**. Mesma disciplina validada nos Sprints 1 e
    2, agora sobre o eixo novo. No grid, a célula exibe `A 4` e `D 8` lado a lado.
- **Validação de entrada** (400 preservado, mesma lógica de antes):
  - corpo com `dimension`/`level` antigos → `Field 'system' must be one of: affect, cognition,
    attention, self, motivation, behavior, biophysiological, sociocultural`
  - `system: "psychological"` → mesmo 400 (o valor sumiu do sistema, como esperado)
  - `operator: "mudanca"` → `Field 'operator' must be one of: variation, selection, retention, context`
  - `severity_score: 11` → `must be an integer between 1 and 10`

### 6.2 Sistema novo e ajuda contextual

Registro em `sociocultural × selection`, desadaptativo, severidade 6.

Ajuda contextual aberta em **Biofisiológico × Retenção** no navegador. Conteúdo exibido:

> **Processos de mudança — Biofisiológico**
> Regulação autonômica *(depende do contexto)* · Reatividade de estresse fisiológico
> *(tipicamente desadaptativo)* · Regulação do ritmo circadiano e do sono *(depende do
> contexto)* · Interocepção *(depende do contexto)*

Processos **genuinamente associados ao sistema**, não herdados do nível psicológico. O viés
descrito na Parte A do Sprint 4 está resolvido. O endpoint serve os 8 sistemas / 32 processos
numa única resposta, como antes.

O campo de notas renderiza com o rótulo e o texto de apoio de A4:
*"Caracterização processual — Retenção / Descreva como este processo se manifesta em termos de
retenção para o sistema biofisiológico — esta caracterização é o que sustenta a fidelidade do
artefato ao modelo teórico."*

Grid confirmado no navegador: 8 linhas × 4 colunas, agrupadas sob os cabeçalhos **DIMENSÕES**
(6 linhas) e **NÍVEIS ADICIONAIS** (2 linhas), com nota de rodapé explicitando que o
agrupamento é de leitura e não produz cruzamento.

### 6.3 Formulação final e varredura HC3

`3 registro(s) em 2 de 8 sistemas.` Os 6 sistemas sem registro aparecem **explicitamente**
como *"Sistema não avaliado nesta sessão…"* — nunca omitidos em silêncio.

Sentenças geradas (template):

> No sistema Comportamento Manifesto, quanto ao operador de Retenção, foi registrado processo
> adaptativo com severidade 4/10. Caracterização do avaliador: "…"
>
> No sistema Comportamento Manifesto, quanto ao operador de Retenção, foi registrado processo
> desadaptativo com severidade 8/10. Caracterização do avaliador: "…"
>
> No sistema Sociocultural, quanto ao operador de Seleção, foi registrado processo desadaptativo
> com severidade 6/10. Caracterização do avaliador: "…"

**Varredura HC3 automatizada** sobre a parte *template* das sentenças (a caracterização
verbatim é excluída por desenho — reproduzi-la sem paráfrase é a regra 4 do HC3, e o texto é do
avaliador). Termos buscados: conectivos causais, sugestão de conduta, linguagem diagnóstica.

- **Sentenças geradas: 0 ocorrências.**
- Único hit em todo o documento: `"diagnóstic"` no **disclaimer** — na construção *"**Não**
  constitui diagnóstico"*, que é a negação e é o próprio texto de proteção. Cabeçalho de aviso
  mantido sem alteração.

Registro explícito: o eixo de operadores é **mais** exigente que o de níveis para HC3 —
"retenção" e "seleção" convidam a prosa causal ("retido **porque**…"). O template não a produz;
quando a causalidade aparece, ela vem da nota verbatim do avaliador, como nos exemplos acima.
Essa restrição está documentada no cabeçalho de `server/src/services/formulation.ts`.

### 6.4 Governança de dados — confirmação por consulta direta ao banco

```
tabelas: eemm_cells, patients, sqlite_sequence
eemm_cells_legacy_backup existe?     NAO
eemm_cells_legacy_backup_v2 existe?  NAO   (nunca criada: eemm_cells tinha 0 linhas)
```

Como a v2 não chegou a existir, o caminho de purga dela foi exercitado com a tabela **semeada à
mão**, para não deixar código novo sem verificação:

- **Órfão** (`patient_id=999`, inexistente) → varredura de bootstrap removeu:
  `[purga] 1 linha(s) orfa(s) removida(s) de eemm_cells_legacy_backup_v2 (paciente ja inexistente).`
- **Ligado a paciente vivo** → `DELETE /api/patients/11` respondeu
  `{"deleted":true,"verified":true,"remaining":{"patients":0,"eemm_cells":0,"eemm_cells_legacy_backup_v2":0}}`
  e registrou
  `[purga] caso id=11 eliminado e verificado: patients=0, eemm_cells=0, eemm_cells_legacy_backup_v2=0 (3 celula(s) removida(s) em cascata)`

A tabela semeada foi eliminada ao fim do teste, deixando o banco no estado pós-migração
verdadeiro (tabelas acima). Os dois casos de teste criados durante a verificação foram
excluídos com verificação de integridade; `patients` e `eemm_cells` terminam com **0 linhas**.

---

## 7. `shared/eemm-types.ts` é, de novo, a fonte única

`Dimension` e `Level` (o tipo antigo), `LEVELS`, `LEVEL_LABELS` e `DIMENSION_LABELS` foram
**removidos por completo** do repositório. Nenhum conjunto paralelo coexiste — era exatamente
esse tipo de divergência que a auditoria já flagrou uma vez entre `server/` e `artifacts/`.

`grep` por `dimension`/`level` como identificadores de schema em `shared/`, `server/src/` e
`client/src/` — **zero ocorrências** fora do que segue:

| Ocorrência | Arquivo | Natureza |
|---|---|---|
| `export const DIMENSIONS` | `shared/eemm-types.ts:36` | Sub-lista de `SYSTEMS`; agrupamento visual (chave "Dimensions" da Figura 1) |
| `dimensions: "Dimensões"` | `shared/eemm-types.ts:96` | Rótulo de `SYSTEM_GROUP_LABELS` |
| `DIMENSIONS` (import) | `client/src/pages/EEMMForm.tsx:4` | Consome o agrupamento visual das linhas |
| 2 menções em comentário | `server/src/database.ts:80,83` | Comentário histórico explicando **por que** não há mapeamento automático |

`ADDITIONAL_LEVELS` é o outro grupo visual. Nenhuma das quatro entradas produz cruzamento: o
eixo é `SYSTEMS`, composto como `[...DIMENSIONS, ...ADDITIONAL_LEVELS]`.

Fora de `shared/`, `server/src/` e `client/src/`, os termos aparecem apenas em `AUDITORIA_METODOLOGIA.md`
e nos logs de sprint anteriores, como registro histórico — que é o lugar deles.

---

## 8. Arquivos alterados

| Arquivo | Alteração |
|---|---|
| `shared/eemm-types.ts` | Reescrito: `SYSTEMS`/`OPERATORS`/`VALENCES`, rótulos, grupos visuais. `Dimension`/`Level` removidos |
| `shared/eemm-processes.ts` | Reindexado por `System`; 2 sistemas novos, 8 processos novos, todos `VERIFICAR` |
| `server/src/database.ts` | Novo schema; migração v1→v2; `DROP` de `eemm_cells_legacy_backup` |
| `server/src/services/purge.ts` | Cobertura de `eemm_cells_legacy_backup_v2` (por caso + órfãos) sob o mesmo TTL |
| `server/src/services/formulation.ts` | Composição por sistema × operador; nota HC3 sobre o eixo de operadores |
| `server/src/routes/eemm.ts` | Validação e upsert por `(system, operator, valence)`; 64 registros no GET |
| `server/src/routes/patients.ts` | Resposta do `DELETE` inclui a contagem da tabela de backup |
| `server/src/routes/processes.ts` | Comentário do endpoint atualizado (8 sistemas / 32 processos) |
| `client/src/pages/EEMMForm.tsx` | Grid 8×4 agrupado; painel por sistema × operador; campo A4 explícito; ajuda por sistema |
| `client/src/pages/Formulation.tsx` | Blocos por sistema (`system`/`systemLabel`/`assessedSystems`) |

---

## 9. Pendências que este sprint deixa em aberto

1. **Revisão bibliográfica dos 17 itens `VERIFICAR`** (§5), por leitura direta de Hayes et al.
   (2020, 2022) e Hofmann & Hayes (2024), **antes da coleta de dados real**. Os 8 itens dos
   sistemas novos são conteúdo escrito neste sprint e nunca conferido contra a fonte.
2. **Terminologia em PT-BR** — não há tradução canônica consolidada do EEMM em português. Os
   termos seguem o uso corrente na literatura brasileira de ACT/RFT e merecem revisão por
   especialista. Vale especialmente para "Adequação ao Contexto" (*context/context fit*), que é
   escolha deste sprint.
3. **Defeito cosmético pré-existente, não corrigido aqui.** Quando a nota do avaliador termina
   em ponto final, a sentença sai com `."` seguido de `.` — `…que produz.".` — porque
   `composeSentence()` acrescenta o ponto ao ver que a string termina em aspas. Vem do Sprint 1,
   é visível na saída da formulação, e não foi alterado neste sprint por estar fora do escopo
   autorizado e por tocar arquivo sob restrição HC3. Correção de uma linha quando for aprovada.
4. **§4.8.4 e §4.10 do TCC** precisam ser atualizados no texto para refletir sistema × operador
   e a eliminação da tabela residual. Este sprint mexeu no artefato, não na dissertação.
