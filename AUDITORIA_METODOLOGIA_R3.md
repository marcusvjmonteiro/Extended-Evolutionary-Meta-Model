# Auditoria de Conformidade Metodológica (DSR/EEMM) — Rodada 3

**Data:** 2026-08-12
**Estado auditado:** commit **`6790ca8`** (`master`), com **árvore de trabalho limpa**.
**Método:** leitura do código-fonte, consulta direta ao schema SQLite, execução ao vivo da
aplicação (API em `:3001`, Vite em `:5173`) com percurso do roteiro T1–T8, e revisão estática
do Dockerfile.

> **Esta é a terceira rodada.** A primeira está em `git show 3212b95:AUDITORIA_METODOLOGIA.md`
> (estado pré-sprints); a segunda em `AUDITORIA_METODOLOGIA.md`, commitada em `84a2e81`. As
> três são preservadas sem sobrescrita. O contraste entre elas é evidência direta da iteração
> de design (Atividade 3).

> ## Rastreabilidade de versão — primeira vez que pode ser afirmada
>
> `git status` → **working tree clean**. `git status --porcelain` → **0 arquivos**.
>
> **O estado auditado nesta rodada corresponde integralmente ao commit `6790ca8`.** As Rodadas
> 1 e 2 não puderam afirmar isso: a Rodada 2 auditou uma árvore com os Sprints 3 e 4 aplicados
> mas não commitados (HEAD era `7e2454b`, que não os continha). O gap de rastreabilidade
> registrado como U2 na Rodada 2 está **fechado**.
>
> Ressalva de precisão: este arquivo (`AUDITORIA_METODOLOGIA_R3.md`) é criado *após* `6790ca8`
> e commitado em seguida. O código auditado é o de `6790ca8`; o relatório é o commit posterior.
> Nenhuma linha de código mudou entre a auditoria e o commit do relatório.

> **Ressalva de método (inalterada):** o documento do TCC não está no repositório. As citações
> de §4.5, §4.8.4, §4.10, §4.6/§5.1, Tabela 2 e Apêndices B/C são as reproduzidas nos pedidos
> de auditoria. Onde a definição exata não foi fornecida, isso é sinalizado em vez de inventado.

---

## 1. Sumário executivo

| Métrica | Rodada 1 | Rodada 2 | **Rodada 3 (atual)** |
|---|---|---|---|
| Estrutura da matriz | 6 dim × 4 níveis (nomenclatura alheia) | 6 dim × 3 níveis = 18 | **8 sistemas × 4 operadores = 32** |
| Taxa de conformidade da matriz | 0/18 (0%) | 18/18 (100%), todas PA | **32/32 (100%) — 24 PF, 8 PA** |
| Critério ≥80% | FALHA | PASSA (≥15/18) | **PASSA (32/32 ≥ 26)** |
| Nenhum sistema AU em todos os operadores | FALHA | PASSA | **PASSA** |
| 24 células dos 6 sistemas dimensionais PF/PA | FALHA | PASSA (6/6 psicológico) | **PASSA (24/24)** |
| Os 4 operadores evolucionários | FALHA (ausentes) | **FALHA (zero ocorrências)** | **PASSA — A4 satisfeito nos 4** |
| **Veredito no critério a priori do §4.8.4** | **FALHA (4 de 4)** | **FALHA (1 de 4)** | **PASSA (0 de 4 reprovadas)** |
| Afirmações do §4.10 verificáveis | 0 de 4 | 1 plena, 1 parcial, 1 ausente, 1 com ressalvas | **2 plenas, 1 parcial, 1 ausente** |
| Achado P0 (backup fora da purga) | — | **ABERTO** | **RESOLVIDO** |
| Tarefas do Apêndice C que quebram | 4 completas + 1 parcial | 0 completas + 1 parcial (T8) | **0 completas + 1 parcial (T8)** |
| Estado auditado sob controle de versão | não | **não** | **sim — `6790ca8`** |

### Veredito, sem atenuação

**O artefato PASSA, pela primeira vez, no critério de conformidade estrutural declarado a
priori na Seção 4.8.4** — nas quatro sub-verificações. O motivo único de reprovação da Rodada 2
(ausência dos operadores evolucionários) foi eliminado: eles não são mais um atributo faltante,
são **um dos dois eixos da matriz**.

Três qualificadores que o autor precisa observar ao citar esse resultado:

1. **A matriz mudou de forma, não só de tamanho.** A Rodada 2 auditou 18 células
   dimensão × nível. Essa estrutura estava **errada** contra a Figura 1 de Hayes et al. (2020):
   os oito sistemas formam um eixo único, não cruzado. A taxa de 100% da Rodada 2 era, portanto,
   100% de conformidade com uma leitura equivocada da fonte primária. **A comparação direta
   entre as taxas das duas rodadas é enganosa** e não deve ser apresentada como progresso
   quantitativo simples — o que mudou foi o denominador e o seu significado.
2. **A4 é ofertado pelo artefato, não exigido dele.** Ver §4.3: o artefato permite salvar uma
   célula apenas com escore numérico, sem caracterização. Verificado ao vivo. As 6 células
   classificadas PA são exatamente as em que A4 depende de conteúdo que o artefato não força.
3. **A correção estrutural expôs, e não criou, uma dívida bibliográfica.** Os itens marcados
   `VERIFICAR` no mapa de processos subiram de 9/24 para **17/32**, porque dois sistemas
   inteiros passaram a ter conteúdo próprio, escrito sem conferência contra a fonte. Isso é
   trabalho tornado visível, não regressão — mas é trabalho a fazer antes da coleta.

**O único ponto de quebra remanescente do roteiro continua sendo a primeira metade de T8**
(transparência de armazenamento/retenção), exatamente como a Rodada 2 isolou. Não houve
regressão nem surgimento de item novo no roteiro.

---

## 2. Bloco 0 — Inventário técnico

### 2.1 Implementação única

Continua única. `SYSTEMS`, `OPERATORS` e `VALENCES` são declarados em **exatamente um ponto**
do repositório:

```
shared/eemm-types.ts:52  export const SYSTEMS = [...DIMENSIONS, ...ADDITIONAL_LEVELS] as const;
shared/eemm-types.ts:55  export const OPERATORS = [
shared/eemm-types.ts:63  export const VALENCES = ["adaptive", "maladaptive"] as const;
```

Busca por declarações duplicadas em `server/src`, `client/src` e `shared` retorna zero
ocorrências fora desse arquivo.

### 2.2 Árvore de rotas (Express)

| Rota | Arquivo |
|---|---|
| `GET /health` | `server/src/index.ts` |
| `GET /api/eemm/processes` | `routes/processes.ts` |
| `GET POST /api/patients`, `GET DELETE /api/patients/:id` | `routes/patients.ts` |
| `GET PUT /api/patients/:id/eemm` | `routes/eemm.ts` |
| `GET /api/patients/:id/formulation` | `routes/formulation.ts` |
| estáticos + fallback SPA (`NODE_ENV=production`) | `server/src/index.ts` |

### 2.3 Schema SQLite (DDL real, extraída de `sqlite_master`)

```sql
CREATE TABLE eemm_cells (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id      INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  system          TEXT NOT NULL CHECK (system IN ('affect','cognition','attention','self',
                    'motivation','behavior','biophysiological','sociocultural')),
  operator        TEXT NOT NULL CHECK (operator IN ('variation','selection','retention','context')),
  valence         TEXT NOT NULL CHECK (valence IN ('adaptive','maladaptive')),
  severity_score  INTEGER CHECK (severity_score IS NULL OR (severity_score BETWEEN 1 AND 10)),
  notes           TEXT,
  updated_at      TEXT DEFAULT (datetime('now')),
  UNIQUE(patient_id, system, operator, valence)
);
CREATE INDEX idx_eemm_cells_patient_id ON eemm_cells(patient_id);
```

Tabelas presentes: `eemm_cells`, `patients`, `sqlite_sequence`. **Nenhuma tabela de backup
legado** (ver Bloco 4).

### 2.4 TypeScript strict

`strict: true` em `server/tsconfig.json` e `client/tsconfig.json`; `tsc --noEmit` exit 0 nos
dois. `server/tsconfig.build.json` (novo no Sprint 6) estende o do server e apenas habilita
emissão. `tsconfig.base.json` da raiz continua **órfã** — não é estendida por nenhum dos dois,
verificado.

---

## 3. Bloco 1 — Objetivos funcionais e não funcionais (§4.5)

| Objetivo | Estado | Observação |
|---|---|---|
| (a) Fluxo estruturado e **sequencial** | **PARCIAL** | Grid livre, sem stepper nem indicador de progresso. Busca por `/32`, `/64` ou "progresso" em `EEMMForm.tsx`: **0 ocorrências**. Inalterado desde a Rodada 2 |
| (b) Interface responsiva | **AUSENTE** | Breakpoints Tailwind (`sm:`/`md:`/`lg:`/`xl:`) em todo `client/src`: **0 ocorrências**. Inalterado |
| (c) Validação estrutural | **PARCIAL** | Validação manual nas rotas + CHECK no banco. `zod` continua ausente das dependências; `date_of_birth` e `notes` sem validação |
| (d) Referências aos processos de mudança | **MELHOROU — ver Bloco 2** | Mapa reindexado por sistema; biofisiológico e sociocultural com listas próprias. Dívida bibliográfica agora explícita (17/32 `VERIFICAR`) |
| (e) Transparência de armazenamento (LGPD) | **AUSENTE** | Ver Bloco 4 / T8. Único ponto de quebra do roteiro |

---

## 4. Bloco 2 — Matriz de conformidade EEMM (§4.8.4), recalculada sobre 8 × 4

### 4.1 Estrutura auditada

- **Eixo 1 — 8 sistemas, NÃO cruzados:** afeto, cognição, atenção, self, motivação,
  comportamento manifesto (as seis dimensões da experiência) + biofisiológico + sociocultural
  (os dois níveis adicionais de análise). Os oito são linhas irmãs do mesmo eixo.
- **Eixo 2 — 4 operadores evolucionários:** variação, seleção, retenção, adequação ao contexto.
- **32 células.** Valência como par de registros paralelos por célula → teto de **64 registros**
  por caso, confirmado ao vivo (`GET /api/patients/:id/eemm` → 64 entradas).

O agrupamento visual "Dimensões" / "Níveis Adicionais" na UI espelha as chaves da Figura 1 e
**não produz cruzamento** — verificado no código (`SYSTEMS = [...DIMENSIONS,
...ADDITIONAL_LEVELS]`, um único array) e na renderização (8 linhas, 4 colunas).

### 4.2 Aplicação das regras de decisão

| Critério | Resultado global | Base factual |
|---|---|---|
| **A1** presença | **✓ nas 32 células** | Grid 8×4 renderizado; `GET .../eemm` devolve 64 entradas sempre completas, primeira `affect × variation × adaptive`, última `sociocultural × context × maladaptive` |
| **A2** fidelidade terminológica **do sistema E do operador** | **✓ nas 32 células** | Os 8 rótulos de sistema e os 4 de operador declarados em `shared/eemm-types.ts` e exibidos como Afeto/Cognição/Atenção/Self/Motivação/Comportamento Manifesto/Biofisiológico/Sociocultural × Variação/Seleção/Retenção/Adequação ao Contexto. Nenhum sinônimo de outra tradição. **Sem a ressalva `✓*` da Rodada 2**: a ajuda contextual agora traz conteúdo próprio dos sistemas biofisiológico e sociocultural |
| **A3** bivalência | **✓ nas 32 células** | `UNIQUE(patient_id, system, operator, valence)`. Verificado ao vivo: `affect × variation` com adaptativo (escore 5) e desadaptativo (escore 8) **coexistindo**; edição do adaptativo (5→2) não tocou o desadaptativo |
| **A4** qualificação processual | **✓ ofertado nas 32; satisfeito de fato onde há texto** | Ver §4.3 — é o critério que exige leitura cuidadosa |

### 4.3 A4 examinado especificamente, como pedido

A pergunta não é "o campo existe?", e sim "o campo carrega caracterização real, ou só um
número?". Foi testada ao vivo, nos dois sentidos.

**O que o artefato oferece:**

- Campo de texto em **cada seção de valência** de **cada célula** — dois por célula, 64 no total.
- Rotulado por propósito, não genericamente: *"Caracterização processual — [operador]"*, com
  texto de apoio *"Descreva como este processo se manifesta em termos de [operador] para o
  sistema [sistema]"*. Confirmado na UI.
- O conteúdo é reproduzido **verbatim** na formulação final: *"Caracterização do avaliador:
  '…'"*.

**Prova positiva** — registro com caracterização real nos **quatro** operadores, em sistemas
distintos:

| Sistema × Operador | Valência | Escore | A4 |
|---|---|---|---|
| Afeto × Variação | adaptativo | 2 | texto, 103 car. |
| Afeto × Variação | desadaptativo | 8 | texto, 87 car. |
| Cognição × Seleção | desadaptativo | 7 | texto, 84 car. |
| Comportamento Manifesto × Retenção | desadaptativo | 9 | texto, 84 car. |
| Sociocultural × Adequação ao Contexto | adaptativo | 4 | texto, 88 car. |
| Biofisiológico × Variação | desadaptativo | 6 | **AUSENTE** (contraprova) |

→ **operadores com A4 satisfeito em ≥1 sistema: 4 de 4.**

**Contraprova, deliberada:** um PUT com `severity_score: 6` e `notes: null` foi **aceito com
HTTP 200**. A célula aparece na formulação como *"No sistema Biofisiológico, quanto ao operador
de Variação, foi registrado processo desadaptativo com severidade 6/10."* — sem caracterização
alguma.

**Conclusão sobre A4, sem atenuação:** o artefato **oferta** A4 em todas as 32 células e **não o
exige** em nenhuma. Não há validação, indicador, nem aviso que distinga uma célula caracterizada
de uma célula apenas pontuada. Um avaliador da Atividade 5 que preencha só os sliders produz uma
formulação estruturalmente completa e processualmente vazia, e nada no artefato sinaliza isso.

**Como isso classifica as células.** A1, A2 e A3 são propriedades do artefato, iguais nas 32.
A4 é a única que depende de conteúdo — e o que a diferencia entre células não é o campo (idêntico
em todas), e sim a **confiabilidade do material de apoio** que sustenta a caracterização:

- **24 células PF** — as dos 6 sistemas dimensionais. A1–A3 garantidos pelo artefato e A4
  ofertado com material de apoio cujas atribuições, embora com 9 itens marcados `VERIFICAR`,
  têm base na literatura de ACT/PBT pré-existente ao repositório.
- **8 células PA** — as dos sistemas biofisiológico e sociocultural, cujo material de apoio é
  conteúdo novo com **8 de 8 itens** marcados `VERIFICAR`. Justificativa de design formulável,
  abaixo.

A classificação não usa "A4 foi exercitado nesta célula durante a auditoria" como critério: isso
mediria o preenchimento de um caso de teste, não uma propriedade do artefato. A verificação ao
vivo em 5 células serve para demonstrar que A4 **é satisfazível** nos quatro operadores — o que o
critério a priori exige —, não para classificar as células individualmente.

**Justificativa de design que sustenta as classificações PA:**

> Nos sistemas biofisiológico e sociocultural, o material de apoio que sustenta a caracterização
> processual (mapa de processos de mudança) é **conteúdo novo, integralmente marcado
> `VERIFICAR`** — 8 de 8 itens sem conferência contra a literatura fonte. O artefato oferece o
> campo e o rótulo, mas o apoio à decisão que tornaria a caracterização confiável ainda não foi
> validado. Classificar essas células como PF seria afirmar uma fidelidade de conteúdo que o
> próprio repositório declara não ter.

**Honestidade sobre o status dessa justificativa:** diferente da justificativa PA da Rodada 2,
esta **não é reconstrução retrospectiva** — a marcação `VERIFICAR` é anterior a esta auditoria,
está no código-fonte e foi produzida no Sprint 5 justamente para não mascarar a lacuna.

### 4.4 Matriz 8 × 4 completa

Legenda: `A1/A2/A3/A4 → classificação`. `✓ᵒ` em A4 = ofertado pelo artefato; `✓ᵛ` = ofertado
**e** verificado ao vivo com caracterização real.

**Dimensões (6 sistemas — 24 células)**

| Sistema | Variação | Seleção | Retenção | Adequação ao Contexto |
|---|---|---|---|---|
| **Afeto** | ✓/✓/✓/✓ᵛ → **PF** | ✓/✓/✓/✓ᵒ → **PF** | ✓/✓/✓/✓ᵒ → **PF** | ✓/✓/✓/✓ᵒ → **PF** |
| **Cognição** | ✓/✓/✓/✓ᵒ → **PF** | ✓/✓/✓/✓ᵛ → **PF** | ✓/✓/✓/✓ᵒ → **PF** | ✓/✓/✓/✓ᵒ → **PF** |
| **Atenção** | ✓/✓/✓/✓ᵒ → **PF** | ✓/✓/✓/✓ᵒ → **PF** | ✓/✓/✓/✓ᵒ → **PF** | ✓/✓/✓/✓ᵒ → **PF** |
| **Self** | ✓/✓/✓/✓ᵒ → **PF** | ✓/✓/✓/✓ᵒ → **PF** | ✓/✓/✓/✓ᵒ → **PF** | ✓/✓/✓/✓ᵒ → **PF** |
| **Motivação** | ✓/✓/✓/✓ᵒ → **PF** | ✓/✓/✓/✓ᵒ → **PF** | ✓/✓/✓/✓ᵒ → **PF** | ✓/✓/✓/✓ᵒ → **PF** |
| **Comportamento Manifesto** | ✓/✓/✓/✓ᵒ → **PF** | ✓/✓/✓/✓ᵒ → **PF** | ✓/✓/✓/✓ᵛ → **PF** | ✓/✓/✓/✓ᵒ → **PF** |

**Níveis Adicionais (2 sistemas — 8 células)**

| Sistema | Variação | Seleção | Retenção | Adequação ao Contexto |
|---|---|---|---|---|
| **Biofisiológico** | ✓/✓/✓/✓ᵒ* → **PA** | ✓/✓/✓/✓ᵒ* → **PA** | ✓/✓/✓/✓ᵒ* → **PA** | ✓/✓/✓/✓ᵒ* → **PA** |
| **Sociocultural** | ✓/✓/✓/✓ᵒ* → **PA** | ✓/✓/✓/✓ᵒ* → **PA** | ✓/✓/✓/✓ᵒ* → **PA** | ✓/✓/✓/✓ᵛ* → **PA** |

`*` = material de apoio integralmente marcado `VERIFICAR` (8 de 8 processos), conforme §4.3.

**Totais: 24 PF + 8 PA = 32. Nenhuma AU.**

### 4.5 Verificações do critério a priori

| Verificação | Resultado |
|---|---|
| Taxa (PF+PA)/32 ≥ 80% (≥26) | **32/32 = 100% → PASSA** — 24 PF, 8 PA, 0 AU |
| Nenhum dos 8 sistemas AU nos 4 operadores simultaneamente | **PASSA** — não há nenhuma célula AU |
| Os 6 sistemas dimensionais com as 24 células PF/PA | **PASSA — 24/24 PF** |
| Cada um dos 4 operadores com A4 satisfeito em ≥1 sistema | **PASSA** — variação (Afeto), seleção (Cognição), retenção (Comportamento Manifesto), contexto (Sociocultural), todos demonstrados ao vivo |

**Veredito: o artefato PASSA no critério a priori do §4.8.4, nas quatro sub-verificações.**
Primeira rodada em que isso ocorre. O qualificador do §1 permanece: a taxa é 100%, com 8 células
PA e um A4 que o artefato oferta sem exigir.

---

## 5. Bloco 3 — Heurísticas (Tabela 2)

| Heurística | Estado | Base |
|---|---|---|
| **HC3** — sem inferência causal/conduta/diagnóstico | **CONFORME** | Ver §5.1 |
| **HC2** — linguagem clínica adequada | **PARCIAL — inalterado** | "Severidade" continua aplicada a processo **adaptativo** (schema `severity_score`, UI "Nível de Severidade", formulação "com severidade 2/10"). Incoerência semântica: um processo adaptativo não tem severidade |
| **HU10** — ajuda no ponto de uso | **CONFORME — melhorou** | Botão `?` nas duas seções do painel, abre dentro do painel. Agora exibe processos **do sistema da célula** |
| **HU2** — correspondência com o raciocínio clínico | **CONFORME — melhorou** | Agrupamento visual "Dimensões"/"Níveis Adicionais" espelha a Figura 1; nota de rodapé explicita que não há cruzamento |
| **HU6** — reconhecimento em vez de memorização | **CONFORME** | Definições operacionais de valência na ajuda |
| **HU9** — recuperação de erros | **PARCIAL — inalterado** | Todo erro de backend retorna `"Internal server error"` genérico (7 ocorrências nas rotas) |
| **HU3** — controle e liberdade (undo) | **PARCIAL — inalterado** | Autosave sobrescreve sem histórico |
| **HU7** — flexibilidade de uso | **PARCIAL — inalterado** | Sem busca/filtro em `PatientList.tsx` (0 ocorrências) |

### 5.1 HC3 — verificação detalhada do output da formulação

Varredura automatizada sobre a **parte template** das sentenças geradas (a caracterização
verbatim é excluída por desenho: reproduzi-la sem paráfrase é a regra 4 do próprio HC3, e o
texto é do avaliador). Termos buscados: conectivos causais, sugestão de conduta, linguagem
diagnóstica.

**Resultado: 0 ocorrências nas 6 sentenças geradas.** Cabeçalho de aviso presente (377
caracteres). Os 3 sistemas sem registro aparecem declarados como *"Sistema não avaliado nesta
sessão…"*, nunca omitidos em silêncio.

**Ponto novo desta rodada, que merece atenção do autor:** o eixo de operadores é **mais**
exigente para HC3 do que o eixo de níveis era. "Retenção" e "seleção" convidam a prosa causal
("retido **porque**…"). O template não a produz — mas as caracterizações do avaliador, colhidas
ao vivo, contêm causalidade (*"vem sendo retida há dois anos pelo alívio imediato que produz"*).
Isso é **correto e desejável**: a causalidade é do clínico, reproduzida verbatim e atribuída a
ele. Mas significa que uma varredura ingênua de conectivos causais sobre o documento inteiro
acusaria falso positivo. Quem for testar HC3 automaticamente precisa excluir o trecho verbatim,
como esta auditoria fez — a restrição está documentada no cabeçalho de
`server/src/services/formulation.ts`.

---

## 6. Bloco 4 — Governança de dados (§4.10)

| Afirmação do §4.10 | Correspondência no código | Veredito |
|---|---|---|
| Purga elimina integralmente os registros **ao término de cada sessão** | Rotina automática em `purge.ts`: passagem imediata no bootstrap + `setInterval` de 15 min, TTL de 4 h desde a criação. **O disparo não é "término de sessão"** — não há autenticação nem sessão | **PARCIAL — mecanismo existe, redação do texto não corresponde** |
| Integridade verificada por consulta ao banco imediatamente após a execução | `deleteCaseAndVerify()` consulta `patients`, `eemm_cells` **e a tabela de backup de migração** após o DELETE. Resposta ao vivo: `{"deleted":true,"verified":true,"remaining":{"patients":0,"eemm_cells":0,"eemm_cells_legacy_backup_v2":0}}` | **VERIFICÁVEL — demonstrável ao vivo** |
| "Purga elimina **integralmente**" (cobertura de tabelas residuais) | **Achado P0 da Rodada 2 resolvido** — ver §6.1 | **VERIFICÁVEL (era AUSENTE)** |
| Separação entre dados **operacionais** e dados de **pesquisa** | Busca por `feedback`, `evaluator`, `sus_`, `questionario` em `server/src`, `client/src`, `shared`: **zero ocorrências**. Nenhuma tabela, rota ou estrutura | **SEM CORRESPONDÊNCIA — ver §6.3** |
| "Sem exportação automática" | Sem dependência de analytics/error-tracking; sem chamada de rede de saída; `.sqlite` fora do tracking. **Ressalvas:** presença histórica em commits anteriores a `7e2454b`; `.dockerignore` fecha o canal novo (§6.4) | **SUSTENTÁVEL COM RESSALVAS** |

### 6.1 Achado P0 da Rodada 2 — RESOLVIDO por eliminação

**Qual das duas saídas ocorreu: a tabela foi ELIMINADA, não coberta pela purga.**

Evidência direta, consulta a `sqlite_master`:

```
tabelas no banco: eemm_cells, patients, sqlite_sequence
eemm_cells_legacy_backup: ELIMINADA
```

Conteúdo eliminado, registrado no log de migração antes do DROP:

```
[migração] eemm_cells_legacy_backup ELIMINADA (1 linha(s) removida(s)) — resíduo do
           schema de 4 níveis, sem cobertura de purga. Achado P0 da auditoria resolvido.
```

A linha era `{dimension:'cognition', level:'biological', severity_score:7, notes:'Déficit leve',
patient_id:1}` — `level='biological'` de um schema de **quatro** níveis que já não existia em
lugar nenhum, órfã, com nota de aparência clínica. A consulta que a Rodada 2 apontou como
falseadora da afirmação central do §4.10 (`SELECT * FROM eemm_cells_legacy_backup;`) **hoje
retorna erro de tabela inexistente**.

O DROP roda **fora** da transação de migração, de propósito: é correção de governança
independente do estado do schema, e precisa acontecer inclusive quando o schema já está
atualizado.

### 6.2 `eemm_cells_legacy_backup_v2` — NÃO é um novo achado P0

Esta é a verificação que a Rodada 3 precisava fazer com mais cuidado, porque a reaparição do
mesmo problema sob outro nome seria péssimo sinal. **Não reapareceu.**

**Estado atual:** a tabela **não existe**. A migração do Sprint 5 só a criaria se `eemm_cells`
tivesse linhas no momento da migração, e tinha zero — o `CREATE`/`INSERT` é condicionado a
`count > 0`.

**Cobertura, caso venha a existir:** está em `purge.ts` por **dois** caminhos, ambos sob o mesmo
`CASE_TTL_SECONDS` de `eemm_cells`:

1. **Por caso** — `deleteCaseAndVerify()` faz `DELETE` explícito das linhas com aquele
   `patient_id`, e a contagem restante entra na `PurgeVerification` e na resposta HTTP. Explícito
   porque a tabela é cópia crua do schema antigo, **sem FK** — o `ON DELETE CASCADE` não a
   alcança. Foi exatamente essa a causa-raiz do P0 anterior.
2. **Órfãos** — `purgeOrphanLegacyBackupRows()` remove, a cada varredura, linhas cujo
   `patient_id` já não existe em `patients`. Sem isso a cobertura teria um buraco do tamanho
   exato do P0: um backup cujo paciente sumiu por outra via nunca mais teria evento que o
   eliminasse.

**Os dois caminhos foram exercitados ao vivo**, com a tabela semeada à mão (já que não existe):
o órfão (`patient_id=999`) foi removido na varredura de bootstrap, e a linha ligada a paciente
vivo foi removida junto com o caso, com verificação retornando 0. A tabela semeada foi eliminada
ao fim do teste.

**Veredito: cobertura verificada, não presumida.** O padrão que gerou o P0 — tabela de migração
criada e esquecida — está fechado nos dois sentidos.

### 6.3 Segregação entre dados operacionais e de pesquisa — decisão pendente do autor

Continua **sem estrutura de feedback de avaliadores dentro do artefato**. Zero ocorrências.

**Isto é aceitável ou precisa de decisão?** Depende de um fato que só o autor pode confirmar, e
a auditoria não deve presumir:

> **Pergunta ao autor:** os instrumentos dos Apêndices C e D (roteiro de tarefas e questionário
> de avaliação) serão aplicados **fora** da plataforma — em formulário próprio, papel, ou
> ferramenta de survey — ou o texto do §4.10 pressupõe que o artefato os colete?

- **Se forem externos** (o que a redação dos apêndices sugere): não há o que segregar dentro do
  artefato, e a afirmação do §4.10 precisa apenas de **ajuste de redação**, deixando claro que a
  segregação é entre o banco operacional do artefato e o instrumento externo de pesquisa. Custo:
  uma frase. Passa a ser item de texto, não de código.
- **Se o texto pressupõe coleta na plataforma**: é gap de implementação real, e a afirmação não
  é sustentável hoje.

Enquanto a pergunta não for respondida, o item permanece **AUSENTE com decisão pendente** — foi
assim que a Rodada 2 o classificou, e nada no código mudou desde então.

### 6.4 Canal de retenção novo, fechado preventivamente

O Sprint 6 introduziu a possibilidade de empacotar a aplicação em imagem de container. Uma
imagem é distribuível, versionada por camada e **sobrevive a qualquer purga por TTL da
aplicação** — assar o `database.sqlite` de desenvolvimento dentro dela seria recriar o P0 numa
escala pior.

`.dockerignore` exclui `*.sqlite`, `*.sqlite-shm`, `*.sqlite-wal` (com e sem `**/`), e o
Dockerfile cria o banco vazio em `/app/data`. **Verificado por leitura do arquivo.** Não
verificado por build real (Bloco 8).

---

## 7. Bloco 5 — Arquitetura e justificativas técnicas (§4.6, §5.1)

Afirmação a verificar: TypeScript foi escolhido porque "a estrutura de dados replica diretamente
a arquitetura do metamodelo".

| Pergunta | Rodada 1 | Rodada 2 | **Rodada 3** |
|---|---|---|---|
| Qual arquivo mostrar a um examinador? | não existia | `shared/eemm-types.ts` | **`shared/eemm-types.ts`** |
| Os eixos estão modelados em tipo? | não | dimensão × nível × valência | **sistema × operador × valência**, os três como uniões literais derivadas de `as const` |
| O eixo evolucionário está modelado? | não | **não** | **sim** — `Operator` é tipo de primeira classe, coluna com CHECK no banco e coluna do grid |
| Fonte única? | não (4 declarações) | sim (1) | **sim** — `SYSTEMS`/`OPERATORS`/`VALENCES` declarados em exatamente 1 ponto |
| Consumido pelas duas pontas? | não | sim | **sim** — alias `@shared/*` via `paths` + `resolve.alias` do Vite |
| `strict` ativo? | sim | sim | **sim**, `tsc --noEmit` exit 0 |

**Veredito: a afirmação do §4.6/§5.1 tem prova material e, pela primeira vez, prova
COMPLETA.** A ressalva número 1 da Rodada 2 — "o tipo modela dimensão × nível × valência mas
**não** o eixo evolucionário, e é aí que 'replica a arquitetura do metamodelo' fica incompleta"
— **está resolvida**. Os dois eixos da Figura 1 estão no sistema de tipos.

O eixo de operadores atravessa o código em 5 arquivos (`shared/eemm-types.ts`,
`server/src/database.ts`, `routes/eemm.ts`, `services/formulation.ts`,
`client/src/pages/EEMMForm.tsx`), contra **zero ocorrências** na Rodada 2.

Ressalva remanescente: `tsconfig.base.json` da raiz não declara `strict` e define
`strictFunctionTypes: false`. **Não governa `server/` nem `client/`** (nenhum dos dois a
estende, verificado), então não enfraquece a justificativa — mas convém saber que existe.

---

## 8. Bloco 6 — Roteiro de tarefas (Apêndice C, T1–T8)

Executado ao vivo contra `6790ca8`.

| # | Tarefa | Resultado | Evidência |
|---|---|---|---|
| **T1** | Criar caso | **Executa** | "Auditoria Rodada 3" criado, id=12 |
| **T2** | Registrar processo adaptativo | **Executa** | `affect × variation × adaptive`, escore 5 + caracterização |
| **T3** | Desadaptativo na **mesma célula** | **Executa** | `affect × variation × maladaptive` coexiste — 2 linhas no banco, nenhuma sobrescrita |
| **T4** | Cobrir sistemas/operadores | **Executa** | 64 registros devolvidos; 6 preenchidos em 5 sistemas e nos 4 operadores; 0 falhas |
| **T5** | Consultar ajuda no ponto de uso | **Executa** | Botão `?` nas duas seções; em **Biofisiológico × Retenção** exibe regulação autonômica, reatividade de estresse fisiológico, ritmo circadiano, interocepção — **conteúdo próprio do sistema**, não processos psicológicos reaproveitados. URL permanece na matriz |
| **T6** | Editar registro anterior | **Executa** | Adaptativo de Afeto×Variação editado 5→2 in place; desadaptativo (8) intacto |
| **T7** | Gerar formulação final | **Executa** | 8 blocos, 5 sistemas avaliados, 6 registros; disclaimer presente; varredura HC3 limpa |
| **T8** | Localizar info de armazenamento/eliminação **e** excluir caso | **PARCIAL** | **Primeira metade quebra:** busca por "privacidade", "retenção", "armazenamento", "LGPD", "4 horas", "TTL" em todo `client/src`: **0 ocorrências**. Rotas do SPA: `/patients`, `/patients/:id/eemm`, `/patients/:id/formulation`, `*`. Não existe `/privacidade` — não há o que localizar. **Segunda metade executa:** `DELETE` retornou `verified:true` e o log registrou `caso id=12 eliminado e verificado: patients=0, eemm_cells=0, eemm_cells_legacy_backup_v2=0 (6 celulas removidas em cascata)` |

**Conclusão: 7 das 8 tarefas executam integralmente; T8 executa pela metade.** Idêntico à
Rodada 2 — **sem regressão e sem item novo**. A primeira metade de T8 continua sendo o **único
ponto de quebra remanescente do roteiro**, exatamente como a Rodada 2 isolou.

**Registro explícito, como pedido:** a ausência da página de transparência é **decisão
consciente do autor de adiar o item para um sprint futuro e separado**, não descuido nem
problema recém-descoberto. Está classificada aqui como **item pendente**, não como regressão.

---

## 9. Bloco 7 — Infraestrutura

`.replit` continua configurado para Repl.it: `deploymentTarget = "autoscale"`,
`build = cd server && npm ci && npm run build && cd ../client && npm ci && npm run build`,
`run = cd server && NODE_ENV=production npm run start`.

**Achado desta rodada:** o Sprint 6 **introduziu duas regressões** nesse caminho de execução, ao
trocar `start` de `ts-node src/` para `node dist/server/src/index.js`. Foram encontradas ao
exercitar o cenário do `.replit` — nenhuma apareceria testando só o container, onde o Dockerfile
compensa por outro caminho.

1. **`npm run start` não subia**: `Cannot find module '@shared/eemm-types'`. O alias só resolvia
   porque o Dockerfile criava `node_modules/@shared`. **Corrigido** movendo o passo para o build
   (`postbuild:alias`, com `fs.cpSync` para ser portátil em Windows).
2. **O build do client não seria servido**: o fallback relativo era correto para ts-node de
   `src/` e errado para `node` de `dist/server/src/`. Modo de falha traiçoeiro — `/api`
   responderia normalmente e **toda rota de página devolveria 404**. **Corrigido** com
   `resolveClientDist()`, que testa a existência de `index.html` nos candidatos e avisa se não
   achar nenhum.

Ambas corrigidas e verificadas no cenário exato do `.replit` (commit `de0832f`): SPA em HTTP
200, `/api` com precedência, banco no `DATABASE_PATH` indicado.

**A limitação da Rodada 2 permanece:** a configuração de deploy **não foi validada em execução
na plataforma**. O que se verificou é que o par `build` + `start` do `.replit` funciona
localmente. Publicação de teste continua necessária antes de qualquer demonstração à banca.

Pontos a reavaliar no §4.10 se a hospedagem mudar (inalterados desde a Rodada 2, e agora mais
relevantes por causa do Bloco 8): isolamento de instância (SQLite em disco local não sobrevive a
múltiplas réplicas nem a filesystem efêmero), política de snapshot da plataforma, e
`CASE_TTL_SECONDS` sobrescrevível por variável de ambiente — ou seja, a política de retenção é
alterável por quem controlar o ambiente.

---

## 10. Bloco 8 — Containerização (NOVO nesta rodada)

| Item | Estado | Evidência |
|---|---|---|
| `Dockerfile` presente | **SIM** | Raiz do repositório, 4 estágios |
| Imagem base com glibc, não alpine | **SIM** | `FROM node:20-slim` nos 4 estágios. Justificado no próprio arquivo: `better-sqlite3@12.8.0` tem install `prebuild-install \|\| node-gyp rebuild`, e os prebuilds publicados são para glibc |
| Multi-stage | **SIM** | `client-build`, `server-build`, `server-deps`, `runtime`. O quarto estágio existe para manter `python3/make/g++` fora da imagem final: `npm ci --omit=dev` reexecuta o script de instalação do módulo nativo |
| `server/src/index.ts` lê `PORT` do ambiente | **SIM** | `server/src/index.ts:22` — `const PORT = Number(process.env.PORT) || 3001;` |
| `DATABASE_PATH` configurável com fallback | **SIM** | `server/src/database.ts:18`, fallback para o caminho histórico — `npm run dev` sem variáveis não mudou |
| Diretório de dados gravável | **SIM (por leitura)** | `RUN mkdir -p /app/data && chown -R node:node /app/data`, `USER node`. Necessário porque a imagem roda como não-root |
| `.dockerignore` cobre os sensíveis | **SIM** | `node_modules/`, `.git/`, `*.sqlite`/`-shm`/`-wal` (com e sem `**/`), `dist/`, `.env*`, `artifacts/`, `lib/`, `scripts/` |
| `lib/` confirmado não utilizado | **SIM** | Busca por importação de `lib/` em `server/src`, `client/src`, `shared`: zero ocorrências. Continua órfão, como as auditorias anteriores apontaram |
| Scripts que o Dockerfile invoca funcionam | **SIM** | `server: npm run build` exit 0 (emite `dist/server/src/*` + `dist/shared/*`); `client: npm run build` exit 0 (39 módulos, 1.31 s) |
| Todos os `COPY` referenciam caminhos existentes | **SIM** | Os 7 caminhos conferidos um a um contra a estrutura real |

**Dois riscos que a revisão estática pegou e que teriam quebrado o build:**

1. **`server/package.json` tinha `"build": "tsc --noEmit"`** — não emitia nada. O Dockerfile
   invoca `npm run build` esperando `dist/`; o estágio teria "sucesso" com diretório vazio.
   Corrigido: `build` emite via `tsconfig.build.json`, `typecheck` continua checando.
2. **O `preinstall` do `package.json` da raiz mataria todo `npm ci`** — ele faz `exit 1` para
   qualquer agente que não seja pnpm ("Use pnpm instead"). Se o Dockerfile copiasse o
   `package.json` da raiz, os três `npm ci` falhariam. Ele não copia; cada estágio entra direto
   em `client/` ou `server/`, que não têm `preinstall` próprio. **Verificado, não presumido.**
   Os dois lockfiles são `lockfileVersion: 3`, standalone, **zero links de workspace**.

### 10.1 O que NÃO foi verificado — este bloco NÃO está resolvido

> **A containerização está PREPARADA E REVISADA ESTATICAMENTE. Não está concluída nem
> validada.** Não há daemon Docker neste ambiente; **`docker build` nunca foi executado**.
>
> Verificação pendente, obrigatória antes de qualquer deploy:
> ```bash
> docker build -t eemm-artefato .
> ```
> ```bash
> docker run --rm -p 8080:8080 eemm-artefato
> ```
> Confirmar: (a) os três `npm ci` completam; (b) **o `better-sqlite3` carrega em runtime** — é a
> premissa central da escolha de glibc e a única que não dá para verificar sem construir;
> (c) `GET /health` responde; (d) a matriz devolve 64 registros; (e) o SQLite é criado em
> `/app/data` e é gravável pelo usuário `node`.

**Nenhum comando de nuvem foi executado neste sprint.** O adiamento do deploy é decisão
deliberada de custo, registrada em `SPRINT_6_LOG.md`.

---

## 11. Bloco 9 — Rastreabilidade de versão (NOVO nesta rodada)

`git status` → **working tree clean**, 0 arquivos pendentes. HEAD = **`6790ca8`**.

```
6790ca8 Corrige referencia de secao no SPRINT_6_LOG apos insercao do 4.5
de0832f Sprint 6: corrige duas regressões de execução fora do container
c03388c Sprint 6: containerização (Dockerfile, .dockerignore, leitura de PORT)
558bf88 Sprint 5: correção estrutural EEMM — sistema × operador (Hayes et al., 2020)
84a2e81 Auditoria de conformidade metodológica — Rodada 2 (pós-Sprints 1-4)
437d194 Sprint 4: ajuda contextual, formulação final e correção de rota-fallback
7d63d38 Sprint 3: purga automática e verificação de integridade pós-purga (§4.10)
7e2454b Converge repositorio numa unica implementacao do artefato
8fec1cc Redesenha schema EEMM para bivalencia e eixo de 3 niveis
3212b95 Adiciona auditoria de conformidade metodologica (DSR/EEMM)
336fe44 Update EEMM grid columns to Variação, Seleção, Retenção
1db1307 Implement patient data management and EEMM cell tracking system
30f7bb7 Add a complete React frontend for patient management and EEMM formulation
e5ced1b Add API endpoints for managing patients and their cells
b6963f8 Add database with patient and cell tracking capabilities
625f3d9 Set up a new project with separate client and server applications
6f06445 Initial commit
```

### 11.1 Limitação honesta da granularidade dos commits

Os Sprints 3, 4 e 5 foram **desenvolvidos sem commits intermediários** e commitados agora, de
uma vez. Os commits agrupam arquivos por sprint lógico, mas **cada arquivo entra no seu estado
final**, não no estado que tinha ao término daquele sprint. Consequência concreta:

- `server/src/services/purge.ts` está no commit do Sprint 3, mas já contém a cobertura de
  `eemm_cells_legacy_backup_v2`, que é do Sprint 5.
- `server/src/database.ts` está no commit do Sprint 5, mas já contém o `DATABASE_PATH`, que é do
  Sprint 6.
- `server/src/index.ts` está no commit do Sprint 6, mas contém o registro de rotas do Sprint 4 e
  o `startPurgeScheduler()` do Sprint 3.

**Portanto: os commits intermediários não são garantidamente compiláveis nem executáveis
isoladamente.** Só o HEAD é. Reconstruir estados intermediários fiéis exigiria reescrever
conteúdo que nunca existiu em disco naquela forma — o que seria fabricação de histórico, pior
que a limitação.

**O que a granularidade entrega, e é o que importa para a Atividade 3:** as mensagens de commit
documentam, por sprint, o que foi decidido e por quê, e o HEAD corresponde exatamente ao estado
auditado. **O que ela não entrega:** capacidade de fazer `git checkout` num sprint intermediário
e rodar a aplicação daquela época.

---

## 12. Tabela consolidada de gaps

| Seção | O que foi prometido | O que existe no código | Classificação | Urgência | Risco de defesa | Ação técnica |
|---|---|---|---|---|---|---|
| §4.10 | Segregação entre dados operacionais e de pesquisa | Estrutura de feedback dos avaliadores não existe | AUSENTE | **U1** | **ALTO** | Responder a pergunta do §6.3. Se os Apêndices C/D forem externos: ajuste de redação. Senão: implementar |
| §4.5-e (NF) | Transparência de armazenamento/retenção (LGPD) | Zero menção na UI, apesar de política real de 4 h | AUSENTE | **U1** | **ALTO** | Página `/privacidade` + link no modal de exclusão; completa a metade faltante de T8 |
| §4.5-d | Terminologia EEMM fiel nos processos | **17 de 32** atribuições marcadas `VERIFICAR`, incluindo **8/8** dos sistemas novos | PARCIAL | **U1** | **ALTO** | Revisão por leitura direta de Hayes et al. (2020, 2022); lista completa em `SPRINT_5_LOG.md` §5 |
| §4.10 | "Purga ao término de cada sessão" | Purga por TTL de 4 h; sistema não tem sessão | PARCIAL | **U1** | **ALTO** | Corrigir a redação do §4.10 (texto substituto em `SPRINT_3_LOG.md` §5.2) |
| §4.8.4 | A4 — qualificação processual | Campo ofertado nas 32 células, **não exigido em nenhuma**; célula salva só com escore é aceita | PARCIAL | **U1** | **MÉDIO** | **Gap novo desta rodada.** Ou exigir texto quando houver escore, ou exibir indicador de célula não caracterizada, ou declarar no texto que A4 é ofertado e não imposto |
| Tabela 2 (HC2) | Linguagem clínica adequada | "Severidade" aplicada a processo adaptativo (schema, UI e formulação) | PARCIAL | **U2** | MÉDIO | Renomear para intensidade/grau de presença, com migração de coluna |
| §4.7 / Bloco 8 | Artefato publicável | Dockerfile **nunca construído**; deploy Replit não validado em plataforma | PARCIAL | **U2** | MÉDIO | `docker build` + `docker run` fora deste ambiente; publicação de teste |
| §4.5-a | Fluxo estruturado **e sequencial** | Grid livre, sem stepper nem progresso | PARCIAL | **U2** | BAIXO | Contador `x/64` no cabeçalho de `EEMMForm.tsx` |
| §4.5-b (NF) | Interface responsiva | Zero breakpoints Tailwind | AUSENTE | **U2** | BAIXO | Breakpoints em `EEMMForm.tsx` e `PatientList.tsx`. **Agravado**: o grid passou de 3 para 4 colunas |
| §4.5-c (NF) | Validação estrutural | Manual nas rotas + CHECK no banco; `date_of_birth`/`notes` sem validação | PARCIAL | **U2** | BAIXO | Adotar `zod` por rota |
| Tabela 2 (HU9) | Recuperação de erros | Todo erro retorna "Internal server error" genérico | PARCIAL | **U2** | BAIXO | Diferenciar erros por tipo nas rotas |
| Tabela 2 (HU3) | Controle e liberdade (undo) | Autosave sobrescreve sem histórico | PARCIAL | **U2** | BAIXO | Confirmação ou histórico por célula |
| — | Formulação sem defeito de composição | Nota terminada em ponto gera `.".` (dois pontos finais) | PARCIAL | **U3** | BAIXO | Correção de uma linha em `composeSentence()` |
| Tabela 2 (HU7) | Flexibilidade de uso | Sem busca/filtro na lista | PARCIAL | **U3** | BAIXO | Campo de busca em `PatientList.tsx` |
| §4.10 | `.sqlite` fora de qualquer canal de exportação | Fora do tracking; presentes em commits anteriores a `7e2454b` | PARCIAL | **U3** | MÉDIO | Declarar como limitação; reescrita de histórico exige decisão à parte |
| — | Granularidade de histórico | Commits por sprint, mas com arquivos em estado final | PARCIAL | **U3** | BAIXO | Sem ação — reconstruir seria fabricar histórico. Declarado no §11.1 |
| — | Limpeza de repositório | `lib/` órfão, `artifacts/mockup-sandbox`, `tsconfig.base.json` órfã | PARCIAL | **U3** | BAIXO | Remover após confirmação; limpar `references` e `pnpm-workspace.yaml` |

### 12.1 Gaps FECHADOS desde a Rodada 2

| Gap da Rodada 2 | Como foi fechado |
|---|---|
| §4.8.4 — 4 operadores evolucionários ausentes | Passaram a ser um dos dois eixos da matriz (32 células) |
| §4.10 — `eemm_cells_legacy_backup` retém dado clínico | **Tabela eliminada** (DROP); sucessora coberta pela purga em dois caminhos |
| §4.5-d — processos psicológicos exibidos em células biofisiológicas/socioculturais | Mapa reindexado por sistema; os dois sistemas ganharam listas próprias |
| §4.6/§5.1 — tipo não modelava o eixo evolucionário | `Operator` é tipo de primeira classe nas duas pontas |
| Rastreabilidade — Sprints 3 e 4 não commitados | Tudo commitado; árvore limpa em `6790ca8` |

---

## 13. Lista priorizada — antes do pré-registro OSF

O pré-registro trava o instrumento e a matriz de conformidade não pode ser reescrita depois para
"caber" no código.

### U1 — bloqueantes

1. **Revisar as 17 atribuições marcadas `VERIFICAR`** contra Hayes et al. (2020, 2022) e Hofmann
   & Hayes (2024). **Subiu de 7 para 17 itens** e é hoje o maior bloco de trabalho pendente. Os 8
   dos sistemas biofisiológico e sociocultural nunca foram conferidos contra a fonte — e são
   exatamente o conteúdo que sustenta a classificação PA de 8 células.
2. **Criar a tela de transparência de armazenamento/retenção (LGPD).** Fecha a metade faltante
   de T8, o único ponto de quebra do roteiro.
3. **Resolver a afirmação sobre segregação de dados operacionais vs. de pesquisa** — responder à
   pergunta do §6.3 e então ajustar redação ou implementar.
4. **Corrigir a redação do §4.10** sobre "término de sessão".
5. **Decidir o tratamento de A4 no texto** (gap novo). O critério a priori diz "qualificação
   processual"; o artefato oferece o campo e não o exige. Se o pré-registro afirmar que A4 é
   satisfeito, precisa dizer **em que sentido** — ofertado pelo instrumento, ou verificado no
   dado coletado. São afirmações diferentes e a segunda depende de conferir os preenchimentos da
   Atividade 5.
6. **Atualizar o texto do §4.8.4** para a estrutura sistema × operador. A matriz de conformidade
   do TCC ainda descreve 18 células; o artefato tem 32. Pré-registrar o número errado é o pior
   desfecho possível deste sprint.

### U2 — antes da coleta, não bloqueiam o pré-registro

7. `docker build` + `docker run` reais, e publicação de teste no Replit.
8. Renomear `severity_score`/"Severidade" para intensidade (HC2).
9. Responsividade real — **prioridade subiu**: o grid passou de 3 para 4 colunas e de 6 para 8
   linhas; em viewport móvel a matriz é hoje menos utilizável do que era na Rodada 2.
10. Indicador de progresso (`x/64`) no cabeçalho da matriz.
11. Validação por schema (`zod`) cobrindo `date_of_birth` e `notes`.
12. Diferenciação de erros de backend (HU9).
13. Undo ou histórico por célula (HU3).

---

## 14. Comparativo entre as três rodadas — para a Atividade 3

| Dimensão de avaliação | Rodada 1 | Rodada 2 | **Rodada 3** |
|---|---|---|---|
| Implementações do artefato no repositório | 2, divergentes e incompatíveis | 1 | 1 |
| Estrutura da matriz vs. Hayes et al. (2020) Fig. 1 | 6 dim × 4 níveis, nomenclatura alheia | 6 dim × 3 níveis — **leitura equivocada** (eixos cruzados) | **8 sistemas × 4 operadores — fiel à fonte** |
| Eixo evolucionário | ausente | **ausente (0 ocorrências)** | **um dos dois eixos da matriz** |
| Bivalência | estruturalmente impossível | schema-enforced | schema-enforced sobre o eixo novo |
| Declarações duplicadas dos eixos | 4 pontos independentes | 1 | 1 |
| Células da matriz | 18 (0 conformes) | 18 (18 PA, 0 PF) | **32 (24 PF, 8 PA)** |
| Sub-verificações reprovadas no §4.8.4 | 4 de 4 | 1 de 4 | **0 de 4** |
| Tarefas do Apêndice C que quebram | 4 completas + 1 parcial | 0 + 1 parcial (T8) | 0 + 1 parcial (T8) |
| Afirmações do §4.10 verificáveis | 0 de 4 | 1 plena, 1 parcial, 1 ausente, 1 com ressalvas | **2 plenas, 1 parcial, 1 ausente** |
| Achados P0 abertos | — | 1 (backup fora da purga) | **0** |
| §4.6/§5.1 (justificativa do TypeScript) | falseável | prova material **incompleta** | **prova material completa** |
| Itens `VERIFICAR` no mapa de processos | — | 9 de 24 *(o log do Sprint 4 dizia 8; o código tinha 9)* | **17 de 32** |
| Artefato containerizável | não | não | **preparado, não validado** |
| Estado auditado sob controle de versão | não | **não** | **sim — `6790ca8`** |

### 14.1 O que este comparativo demonstra, e o que ele não demonstra

**Demonstra** o ciclo de rigor da DSR em três iterações completas: diagnóstico → correção →
rediagnóstico, com cada rodada preservada e nenhuma reprovação apagada. A Rodada 1 reprovou nas
quatro sub-verificações e foi commitada assim (`3212b95`). A trajetória documentada é mais
defensável perante uma banca do que um artefato que aparenta nunca ter tido problema.

**Demonstra também um achado metodologicamente mais interessante que a própria aprovação:** a
Rodada 2 registrou 100% de conformidade sobre uma estrutura que estava **errada**. A auditoria
passou porque o artefato correspondia ao que o texto do TCC descrevia — e o texto descrevia mal
a fonte primária. Só a conferência direta contra a Figura 1 de Hayes et al. (2020) expôs isso.
**Uma matriz de conformidade só é tão boa quanto a leitura da fonte que a define**, e esse é um
ponto que vale ser dito explicitamente na Atividade 3.

**Não demonstra** que o artefato está pronto para coleta. Restam seis itens U1, dos quais dois
(revisão bibliográfica dos 17 `VERIFICAR` e atualização do §4.8.4 no texto) são pré-requisitos
diretos do pré-registro. A aprovação no critério a priori é sobre a **estrutura** do artefato,
não sobre a **validade do conteúdo** que ela carrega.
