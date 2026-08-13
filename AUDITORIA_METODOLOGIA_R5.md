# Auditoria de Conformidade Metodológica (DSR/EEMM) — Rodada 5

**Data:** 2026-08-12
**Estado auditado:** working tree após os Sprints 9 e 10.
**Foco:** propagação das citações bibliográficas e **recálculo da matriz de conformidade**.
**Método:** leitura de código, consulta direta ao SQLite, execução ao vivo (API `:3001`, Vite
`:5173`) e revisão do histórico Git.

> **Auditorias preservadas, nenhuma sobrescrita.** R1 em `git show 3212b95:AUDITORIA_METODOLOGIA.md`;
> R2 em `AUDITORIA_METODOLOGIA.md` (`84a2e81`); R3 em `AUDITORIA_METODOLOGIA_R3.md` (`af011e4`);
> R4 em `AUDITORIA_METODOLOGIA_R4.md` (`dcf35a0`). Esta é a quinta.

> ## ⚠ Rastreabilidade de versão — REGREDIU
>
> `git status` → **5 arquivos pendentes**. HEAD = `dcf35a0`, que é o commit da **Rodada 4** e
> **não contém os Sprints 9 e 10**.
>
> ```
>  M docs/verificacao-processos-eemm.md
>  M shared/eemm-processes.ts
> ?? SPRINT_9_LOG.md
> ?? SPRINT_10_LOG.md
> ?? docs/decisions/
> ```
>
> **O estado auditado nesta rodada NÃO corresponde a nenhum commit.** As Rodadas 3 e 4 puderam
> afirmar correspondência integral; esta não pode. É o mesmo gap que a R2 registrou e que a R3
> tinha fechado — **reaberto**, e listado como U1 na tabela de gaps (§8).
>
> Nada aqui invalida os achados: eles descrevem o código em disco, verificado ao vivo. O que se
> perde é a capacidade de dizer *"o artefato auditado é o commit X"* — que é justamente o que
> torna uma auditoria citável numa defesa.

> **Ressalva de método (inalterada):** o documento do TCC não está no repositório. As citações de
> §4.5, §4.8.4, §4.10 e Apêndices B/C são as reproduzidas nos pedidos de auditoria.

---

## 1. Sumário executivo

| Métrica | R1 | R2 | R3 | R4 | **R5 (atual)** |
|---|---|---|---|---|---|
| Estrutura da matriz | 6×4 | 6×3 = 18 | 8×4 = 32 | 32 | **32** |
| **Células PF / PA** | 0 / 0 (todas AU) | 0 PF / 18 PA | 24 PF / 8 PA | 24 PF / 8 PA | **ver §3 — depende do critério** |
| Sub-verificações reprovadas no §4.8.4 | 4 de 4 | 1 de 4 | 0 de 4 | 0 de 4 | **0 de 4** |
| Tarefas do Apêndice C que quebram | 4 + 1 parcial | 0 + 1 parcial | 0 + 1 parcial | **0** | **0** |
| Marcadores `// VERIFICAR:` | — | 9 de 24 | 17 de 32 | 17 de 32 | **0** |
| Processos com `source` completo | — | — | — | 0 de 30 | **16 de 31** |
| Achados P0 abertos | — | 1 | 0 | 0 | 0 |
| Transparência LGPD | ausente | ausente | ausente | presente | presente |
| `docs/decisions/segregacao-dados-pesquisa.md` | — | — | AUSENTE | AUSENTE | **PRESENTE** |
| Estado auditado sob controle de versão | não | não | **sim** (`6790ca8`) | **sim** (`dcf35a0`) | **NÃO — regrediu** |

### O número que esta rodada foi convocada para produzir

> **Aplicando literalmente a regra de promoção fixada na Rodada 4, a matriz passa de 24 PF / 8 PA
> para 32 PF / 0 PA — e o critério a priori do §4.8.4 continua PASSANDO nas quatro
> sub-verificações, agora com componente PF integral.**
>
> **Mas esse número só se sustenta sob um critério que a própria regra, aplicada de forma
> uniforme, contradiz.** Ver §3.3: sob a regra literal, os 6 sistemas dimensionais — hoje PF desde
> a R3 — **não passariam no teste que acaba de promover os outros dois**.

Esta é a conclusão central da rodada, e ela não é sobre engenharia: é sobre qual critério o TCC vai
pré-registrar. As duas leituras defensáveis estão em §3.4, com o número resultante de cada uma.

---

## 2. Bloco Novo 1 — Verificação da propagação bibliográfica

### 2.1 Marcadores

```
grep -c "// VERIFICAR:" shared/eemm-processes.ts   ->   0
```

**Zero.** Os 17 itens da revisão original estão resolvidos (16 no Sprint 9, o item 5 no Sprint 10).

### 2.2 Completude dos campos `source`

Verificado não só que o objeto existe, mas que os **quatro subcampos** (`reference`, `location`,
`verifiedBy`, `verifiedAt`) estão preenchidos e não vazios.

**16 de 31 processos** têm `source` completo. Nenhum tem `source` parcial — não há caso de
referência sem localização, que a própria tabela de rastreabilidade define como "não verificado".

Os 16 correspondem exatamente aos itens em escopo dos Sprints 9 e 10:

| Origem | Itens | Processos resultantes com `source` |
|---|---|---|
| Sprint 9, propagação direta e com renome | 1, 2, 3, 4, 6, 10, 11, 12, 13, 14, 15, 16 | 12 |
| Sprint 9, mudanças estruturais | 7→C2, 8+9→C5 | 2 |
| Sprint 10 | 5, 18 | 2 |
| **Total** | | **16** |

Os itens 7, 8 e 17 não geraram processo próprio: 7 foi substituído, 8 absorvido na fusão, 17
removido sem substituto.

### 2.3 Mudanças estruturais do Sprint 9 — todas confirmadas

| Mudança | Verificação | Resultado |
|---|---|---|
| Item 7 removido de Motivação | `name: "Hierarquização de objetivos"` | **0 ocorrências** — removido |
| "Ação valorizada" em Motivação com `source` | presença + `verifiedBy` | **confirmado** |
| Item 13 (Interocepção) agora em Afeto | posição no mapa | **em `affect`, ausente de `biophysiological`** |
| Item 17 removido sem substituto | `name: "Papéis socioculturais"` | **0 ocorrências** — removido |
| Itens 8 e 9 fundidos em Comportamento Manifesto | `name:` dos dois antigos | **0 ocorrências**; existe "Repertório comportamental (amplitude e flexibilidade)" com `source` |

Os quatro nomes removidos **ainda aparecem no arquivo**, mas exclusivamente em **comentários de
rastreabilidade** (linhas 293, 329, 330, 350, 450), que registram de onde cada decisão veio.
Nenhum é `name:` de processo. Isso é bom design de registro, não resíduo.

### 2.4 Contagem de processos por sistema — bate integralmente

| Sistema | Esperado | **Real** | |
|---|---|---|---|
| Afeto | 5 | **5** | OK |
| Cognição | 4 | **4** | OK |
| Atenção | 4 | **4** | OK |
| Self | 4 | **4** | OK |
| Motivação | 3 | **3** | OK |
| Comportamento Manifesto | 4 | **4** | OK |
| Biofisiológico | 3 | **3** | OK |
| Sociocultural | 4 | **4** | OK |
| **Total** | 31 | **31** | **nenhuma divergência** |

### 2.5 Comentário de justificativa do 4º processo de Biofisiológico

**Presente**, `shared/eemm-processes.ts:355–364`, imediatamente acima da lista do sistema.
Registra a busca negativa nas três fontes-âncora e o descarte do polimorfismo 5-HTT por ser
"medida correlacional de pesquisa genética, não processo modificável em contexto clínico".

### 2.6 Ordem de autoria

`"Hayes, Hofmann & Ciarrochi (2022)"` em `shared/eemm-processes.ts`: **0 ocorrências**. ✓

Em `docs/verificacao-processos-eemm.md`: **1 ocorrência**, na linha 30 — e o contexto é a nota que
**declara essa forma incorreta**:

> "`Hayes, Hofmann & Ciarrochi (2022)` está **incorreta** (omite dois coautores e altera a ordem)
> e não deve ser usada."

Não é uso indevido; é a definição da forma canônica. **Observação operacional:** se a checagem
pretendida for um grep que deva retornar zero, essa nota precisa ser reescrita para não citar a
string literal — é o mesmo problema que o Sprint 8 teve com o marcador `// VERIFICAR:` e corrigiu.

**Pendência herdada, não resolvida:** as quatro ocorrências de `Hofmann & Hayes (2024)` (ordem
truncada da referência de 2024), sinalizadas no `SPRINT_9_LOG.md` §5, seguem **não corrigidas** —
incluindo `shared/eemm-processes.ts:6`, que é código de produção. Aguardam autorização.

---

## 3. Bloco Novo 2 — Recálculo da matriz de conformidade

### 3.1 Estado de citação por sistema

A regra fixada na R4: *uma célula migra de PA para PF quando **todos** os processos que sustentam
aquele **sistema** têm `source` registrado. Promoção parcial não é válida.*

| Sistema | Processos | Com `source` | Regra satisfeita? | Processos que bloqueiam |
|---|---|---|---|---|
| Afeto | 5 | 3 | **NÃO** | Evitação experiencial; Aceitação (disposição) |
| Cognição | 4 | 2 | **NÃO** | Fusão cognitiva; Desfusão cognitiva |
| Atenção | 4 | 1 | **NÃO** | Atenção flexível ao momento presente; Rigidez atencional; Desengajamento atencional |
| Self | 4 | 1 | **NÃO** | Self como contexto; Self conceitualizado; Tomada de perspectiva |
| Motivação | 3 | 1 | **NÃO** | Clareza de valores; Motivação por controle aversivo |
| Comportamento Manifesto | 4 | 1 | **NÃO** | Ação comprometida; Rigidez comportamental; Esquiva comportamental / inação |
| **Biofisiológico** | 3 | **3** | **SIM** | — |
| **Sociocultural** | 4 | **4** | **SIM** | — |

### 3.2 Biofisiológico com 3 processos — A1 é satisfeito?

A pergunta foi colocada explicitamente, e a resposta é **sim, A1 é satisfeito**.

**A1 (presença)** foi definido e aplicado desde a R3 como uma propriedade do **instrumento**: a
célula existe, é renderizada no grid, aceita registro e é devolvida pela API. Verificado nesta
rodada: 64 registros, 32 células, as 4 células de Biofisiológico presentes e funcionais.

**O número de processos de referência não entra em A1.** Se entrasse, A1 teria sido ✗ em todas as
32 células na R3, quando nenhum processo tinha citação — e foi ✓. A lista de processos é
**material de apoio à decisão**, e é sobre ela que **A4** se apoia, não A1.

Há um argumento contrário que merece registro: um sistema com menos processos de referência oferece
menos apoio ao avaliador, e isso poderia ser lido como cobertura incompleta do sistema. **Mas esse
é um argumento sobre validade de conteúdo, não sobre presença estrutural** — e o Sprint 10
documentou que a ausência do 4º processo é resultado de **busca negativa justificada**, não de
trabalho não feito. Um sistema que a literatura-fonte sustenta com três processos é adequadamente
representado com três.

### 3.3 O achado central: a regra, aplicada de forma uniforme, contradiz a classificação vigente

Sob a regra literal da R4, apenas **Biofisiológico e Sociocultural** a satisfazem. Os **seis
sistemas dimensionais não a satisfazem** — 15 dos seus 24 processos não têm `source`.

Esses seis sistemas são **exatamente as 24 células classificadas PF desde a R3**.

Ou seja, aplicar a regra uniformemente produziria a inversão completa da matriz: as 8 células que
eram PA passariam a PF, e as 24 que eram PF passariam a PA. **Nenhuma leitura defensável do §4.8.4
sustenta esse resultado**, o que é a evidência mais forte de que a regra da R4 não é o critério
correto para o mapa inteiro — ela foi formulada para resolver um caso específico (conteúdo novo,
integralmente não verificado) e não generaliza.

A razão da assimetria está registrada desde a R3 §4.3 e continua verdadeira: as 24 células
dimensionais nunca foram PF por "todos os processos citados". Foram PF porque suas atribuições
**tinham base na literatura de ACT/PBT anterior ao repositório**, com dúvidas pontuais marcadas. As
8 células eram PA porque o conteúdo era **novo, escrito no Sprint 5, sem base nenhuma**. Eram
condições qualitativamente diferentes, e a regra da R4 mediu só uma delas.

### 3.4 As duas leituras defensáveis, e o número de cada uma

| Critério | Bio/Socio | 6 dimensionais | Resultado | Avaliação |
|---|---|---|---|---|
| **(a) Zero marcadores `VERIFICAR` pendentes no sistema** | passa | passa | **32 PF / 0 PA** | Coerente com o histórico das cinco rodadas: era a ausência de conferência que rebaixava, e ela acabou |
| **(b) Todos os processos do sistema com `source`** | passa | **falha** | **8 PF / 24 PA** | Inverte a matriz; nenhuma leitura do §4.8.4 sustenta |

**Recomendação da auditoria: adotar (a)**, e declará-lo explicitamente no §4.8.4 antes do
pré-registro. É o critério que a série de rodadas efetivamente aplicou, é o que corresponde à
distinção real entre os dois grupos de células, e produz um resultado interpretável.

**O que (a) exige que o texto diga com precisão:** que a conformidade do atributo A4 é avaliada
pela **ausência de atribuições pendentes de conferência**, não pela presença de citação formal em
todos os processos. São afirmações diferentes, e apenas a primeira é verdadeira hoje para os 31
processos.

### 3.5 Matriz 8 × 4 reclassificada — sob o critério (a)

Notação: `A1/A2/A3/A4 → classificação`.

**Dimensões (6 sistemas — 24 células)**

| Sistema | Variação | Seleção | Retenção | Adequação ao Contexto |
|---|---|---|---|---|
| **Afeto** | ✓/✓/✓/✓ → **PF** | ✓/✓/✓/✓ → **PF** | ✓/✓/✓/✓ → **PF** | ✓/✓/✓/✓ → **PF** |
| **Cognição** | ✓/✓/✓/✓ → **PF** | ✓/✓/✓/✓ → **PF** | ✓/✓/✓/✓ → **PF** | ✓/✓/✓/✓ → **PF** |
| **Atenção** | ✓/✓/✓/✓ → **PF** | ✓/✓/✓/✓ → **PF** | ✓/✓/✓/✓ → **PF** | ✓/✓/✓/✓ → **PF** |
| **Self** | ✓/✓/✓/✓ → **PF** | ✓/✓/✓/✓ → **PF** | ✓/✓/✓/✓ → **PF** | ✓/✓/✓/✓ → **PF** |
| **Motivação** | ✓/✓/✓/✓ → **PF** | ✓/✓/✓/✓ → **PF** | ✓/✓/✓/✓ → **PF** | ✓/✓/✓/✓ → **PF** |
| **Comportamento Manifesto** | ✓/✓/✓/✓ → **PF** | ✓/✓/✓/✓ → **PF** | ✓/✓/✓/✓ → **PF** | ✓/✓/✓/✓ → **PF** |

**Níveis Adicionais (2 sistemas — 8 células) — MIGRAM DE PA PARA PF nesta rodada**

| Sistema | Variação | Seleção | Retenção | Adequação ao Contexto |
|---|---|---|---|---|
| **Biofisiológico** | ✓/✓/✓/✓ → **PF** | ✓/✓/✓/✓ → **PF** | ✓/✓/✓/✓ → **PF** | ✓/✓/✓/✓ → **PF** |
| **Sociocultural** | ✓/✓/✓/✓ → **PF** | ✓/✓/✓/✓ → **PF** | ✓/✓/✓/✓ → **PF** | ✓/✓/✓/✓ → **PF** |

**Totais: 32 PF, 0 PA, 0 AU.**

#### Justificativa escrita da migração das 8 células

A classificação PA dessas células, estabelecida na R3 §4.3 e mantida na R4, tinha **uma única
razão declarada**:

> "o material de apoio que sustentaria a caracterização processual é conteúdo novo com 8 de 8
> itens sem base citável."

**Essa dívida bibliográfica foi resolvida.** Especificamente:

- **Biofisiológico** — os 3 processos (Atividade do SNA/VFC, Estresse fisiológico, Sono) têm
  `source` completo, verificados por Marcus e Gabriel em 2026-08-12, com localização exata em
  Hayes, Ciarrochi, Hofmann, Chin & Sahdra (2022) e Ciarrochi et al. (2024). O 4º processo não
  existe por **busca negativa documentada**, não por omissão.
- **Sociocultural** — os 4 processos (Suporte social, Normas de grupo, Autoestigma, Vínculo e
  pertencimento) têm `source` completo, com as mesmas fontes e data. O processo que faltava desde
  a remoção de "Papéis socioculturais" foi reposto no Sprint 10 já citado.

Não resta, nesses dois sistemas, nenhum processo cuja atribuição esteja pendente de conferência
contra a literatura fonte — que era a condição que sustentava PA.

#### Três ressalvas que acompanham a migração, sem revertê-la

1. **`Estresse fisiológico` está registrado como confiança baixa** — fonte única, sem terminologia
   técnica nas fontes-âncora. Tem citação; o próprio registro declara o suporte como fraco.
2. **`Normas de grupo` e `Autoestigma` têm sobreposição declarada** com Cognição (comportamento
   governado por regras) e Self (self conceitualizado), respectivamente. Afeta a distintividade dos
   processos, não a existência da citação.
3. **Biofisiológico cobre menos terreno conceitual** do que cobria antes do Sprint 9 — perdeu
   Interocepção para Afeto sem substituto. Documentado e justificado, mas é fato sobre a extensão
   do sistema.

Nenhuma das três é motivo para manter PA sob o critério (a): todas são ressalvas **de qualidade da
citação**, não de **ausência** dela. Mas todas devem constar no texto quando a taxa de 100% PF for
citada.

### 3.6 Veredito recalculado do critério a priori (§4.8.4)

| Verificação | R4 | **R5** |
|---|---|---|
| Taxa (PF+PA)/32 ≥ 80% (≥26) | PASSA — 32/32, 24 PF + 8 PA | **PASSA — 32/32, 32 PF + 0 PA** |
| Nenhum sistema AU nos 4 operadores | PASSA | **PASSA** — nenhuma célula AU |
| 24 células dos 6 sistemas dimensionais PF/PA | PASSA — 24 PF | **PASSA — 24 PF** |
| Cada operador com A4 satisfeito em ≥1 sistema | PASSA | **PASSA** |

**O veredito não muda — passava e continua passando nas quatro. O que muda é a composição: o
componente PA foi a zero.**

---

## 4. Bloco Novo 3 — Consistência da ajuda contextual (UI)

Lido da interface real, abrindo o painel e o botão `?` de cada sistema — não do backend.

| Sistema | Exibidos | Conteúdo |
|---|---|---|
| **Motivação** | **3** | Clareza de valores; Motivação por controle aversivo; **Ação valorizada (valores como base motivacional)** |
| **Sociocultural** | **4** | Suporte social; Normas de grupo; Autoestigma; **Vínculo e pertencimento** |
| **Biofisiológico** | **3** | Atividade do SNA (VFC); Estresse fisiológico; Sono (higiene do sono) |
| **Afeto** | **5** | Evitação experiencial; Aceitação (disposição); Supressão (regulação emocional); Consciência emocional; **Interocepção** |

**Batem exatamente** com o esperado após os Sprints 9 e 10, incluindo as renomeações e a migração
de Interocepção. O que o avaliador da Atividade 5 vai ver corresponde ao que o mapa declara.

---

## 5. Blocos herdados — confirmação de não regressão

| Verificação | Resultado |
|---|---|
| Matriz: 64 registros, 32 células | **inalterada** |
| T1 criar caso | **executa** |
| T2/T3 bivalência na mesma célula | **executa** — Sociocultural × Seleção com adaptativo (5) e desadaptativo (7) coexistindo |
| T5 ajuda no ponto de uso | **executa** — ver §4 |
| T7 formulação final | **executa** — 2 registros em 1 de 8 sistemas, sentenças corretas |
| T8 localizar informação de retenção | **executa** — `/privacidade`, TTL "4 horas" |
| T8 excluir caso | **executa** — `verified:true` |
| **Roteiro T1–T8** | **8/8 sem quebra** — mantido desde a R4 |
| Purga e verificação pós-purga | **funcionando** — log registra eliminação verificada em cascata |
| `eemm_cells_legacy_backup` / `_v2` | **ambas ausentes**; `patients: 0`, `eemm_cells: 0` |
| `shared/eemm-types.ts` fonte única | **sim** — `DIMENSIONS`, `SYSTEMS`, `OPERATORS`, `VALENCES` declarados em 1 ponto; zero duplicatas |
| Console do navegador | **sem erros** |
| `docs/decisions/segregacao-dados-pesquisa.md` | **PRESENTE** — ver §5.1 |
| Árvore limpa | **NÃO** — ver ressalva no topo |

### 5.1 Segregação operacional/pesquisa — arquivo agora existe

Reportado AUSENTE nas Rodadas 3 e 4. **Foi criado** e registra a decisão: os instrumentos dos
Apêndices C e D são aplicados **externamente à plataforma**; a segregação é arquitetural por
não-existência de canal compartilhado.

**Coerência com o código, verificada:** busca por `feedback`, `evaluator`, `sus_`, `questionario`
em `server/src`, `client/src` e `shared` → **zero ocorrências**. A afirmação do documento é
verificável no repositório.

**Uma afirmação do documento que esta auditoria não pode verificar:** a frase final, *"A afirmação
do §4.10 do TCC foi ajustada para refletir essa arquitetura com precisão"*, é sobre a dissertação,
que está fora do repositório. O arquivo fecha o gap de **decisão registrada**; a alteração do texto
do TCC continua sendo item que só os autores confirmam.

---

## 6. Tabela consolidada de gaps remanescentes

| Seção | O que falta | Classificação | Urgência | Risco de defesa | Natureza |
|---|---|---|---|---|---|
| — | **Sprints 9 e 10 não commitados**; estado auditado fora do controle de versão | AUSENTE | **U1** | **ALTO** | **código** |
| §4.8.4 | Texto do TCC ainda descreve 18 células; artefato tem 32 | AUSENTE | **U1** | **ALTO** | texto |
| §4.8.4 | **Critério de A4 não declarado**: "sem pendências de conferência" (a) vs. "todos citados" (b) — números diferentes (32 PF vs. 8 PF) | AUSENTE | **U1** | **ALTO** | texto/decisão |
| §4.10 | Redação "ao término de cada sessão"; mecanismo é TTL desde a criação | PARCIAL | **U1** | **ALTO** | texto |
| §4.5-d | 15 de 31 processos sem `source` (nunca marcados) | PARCIAL | **U2** | MÉDIO | decisão |
| — | 3 `typicalValence` inferidas por mim, não pelos autores | PARCIAL | **U2** | BAIXO | decisão |
| — | 4 ocorrências de `Hofmann & Hayes (2024)` com ordem truncada, incl. código de produção | PARCIAL | **U2** | BAIXO | código |
| §4.7 | `docker build` nunca executado; deploy não validado | PARCIAL | **U2** | MÉDIO | código |
| §4.8.4 | A4 ofertado e sinalizado, não exigido | PARCIAL | **U2** | MÉDIO | texto |
| Tabela 2 (HC2) | "Severidade" aplicada a processo adaptativo | PARCIAL | **U2** | MÉDIO | código |
| §4.5-b | Zero breakpoints Tailwind; grid 8×4 | AUSENTE | **U2** | BAIXO | código |
| §4.5-a | Sem indicador de progresso geral (`x/64`) | PARCIAL | **U2** | BAIXO | código |
| §4.5-c | `zod` ausente | PARCIAL | **U2** | BAIXO | código |
| Tabela 2 (HU9/HU3) | Erros genéricos; autosave sem histórico | PARCIAL | **U2** | BAIXO | código |
| — | Nota terminada em ponto gera `.".` | PARCIAL | **U3** | BAIXO | código |
| — | Nota em `docs/verificacao-processos-eemm.md:30` cita a forma incorreta de 2022 (impede grep-zero) | PARCIAL | **U3** | BAIXO | código |
| Tabela 2 (HU7) | Sem busca/filtro na lista | PARCIAL | **U3** | BAIXO | código |
| §4.10 | `.sqlite` em commits anteriores a `7e2454b` | PARCIAL | **U3** | MÉDIO | texto |
| — | `lib/` órfão, `artifacts/`, `tsconfig.base.json` órfã | PARCIAL | **U3** | BAIXO | código |

### 6.1 Gaps fechados nesta rodada

| Gap | Como foi fechado |
|---|---|
| §4.5-d — 17 atribuições sem base citável | **Todas resolvidas.** 0 marcadores; 16 processos com `source` completo |
| §4.8.4 — 8 células PA por dívida bibliográfica | **Dívida resolvida**; células migram para PF sob o critério (a) |
| §4.10 — segregação operacional/pesquisa sem decisão registrada | Arquivo criado e **coerente com o código** |

---

## 7. O que falta antes do pré-registro OSF

A partir desta rodada a separação importa: **a engenharia está substancialmente concluída, e o que
resta é majoritariamente decisão e redação humana.**

### 7.1 Trabalho de CÓDIGO pendente — pouco, e só um é U1

| # | Item | Urgência |
|---|---|---|
| 1 | **Commitar os Sprints 9 e 10** e o `docs/decisions/`. Único U1 de código; restaura a rastreabilidade que a R3 conquistou e esta rodada perdeu | **U1** |
| 2 | `docker build` + `docker run` reais, fora deste ambiente | U2 |
| 3 | Corrigir a ordem de autoria em `shared/eemm-processes.ts:6` (mediante autorização) | U2 |
| 4 | Renomear "severidade" (HC2); responsividade; `x/64`; `zod`; erros diferenciados; undo | U2 |
| 5 | Defeito cosmético `.".`; nota da linha 30; busca na lista; limpeza de `lib/` | U3 |

### 7.2 Trabalho de DECISÃO e TEXTO pendente — é aqui que está o caminho crítico

| # | Item | Urgência |
|---|---|---|
| 1 | **Declarar no §4.8.4 qual é o critério de A4** — (a) sem pendências de conferência, ou (b) todos os processos citados. **Muda o resultado de 32 PF para 8 PF.** Pré-registrar sem essa definição deixa a matriz reinterpretável depois, que é exatamente o que o pré-registro existe para impedir | **U1** |
| 2 | **Atualizar o §4.8.4 para 32 células** (8 sistemas × 4 operadores) | **U1** |
| 3 | **Corrigir a redação do §4.10** sobre "término de sessão" — hoje contrastável com a tela `/privacidade` do próprio artefato | **U1** |
| 4 | **Confirmar as 3 `typicalValence`** que preenchi por inferência (Ação valorizada, Repertório comportamental, Vínculo e pertencimento) — não são afirmações bibliográficas, mas são exibidas ao avaliador | U2 |
| 5 | **Decidir sobre os 15 processos sem `source`** — citá-los, ou declarar no texto que a conferência cobriu os pontos duvidosos e não o mapa inteiro. Hoje "o mapa tem base bibliográfica registrada" é verdade para 16 de 31 | U2 |
| 6 | **Decidir a redação sobre A4** — ofertado e sinalizado pelo instrumento vs. verificado no dado coletado | U2 |
| 7 | Registrar no texto as três ressalvas de qualidade de citação da §3.5 (confiança baixa em Estresse fisiológico; sobreposições de Normas de grupo e Autoestigma) | U2 |

---

## 8. Comparativo entre as cinco rodadas — para a Atividade 3

| Dimensão | R1 | R2 | R3 | R4 | **R5** |
|---|---|---|---|---|---|
| Estrutura vs. Hayes et al. (2020) Fig. 1 | 6×4, nomenclatura alheia | 6×3 — leitura equivocada | 8×4 — fiel | fiel | fiel |
| Células PF / PA / AU | 0/0/18 | 0/18/0 | 24/8/0 | 24/8/0 | **32/0/0** |
| Sub-verificações reprovadas | 4 de 4 | 1 de 4 | 0 de 4 | 0 de 4 | 0 de 4 |
| Tarefas do Apêndice C que quebram | 4 + 1 parcial | 0 + 1 parcial | 0 + 1 parcial | **0** | **0** |
| Marcadores `VERIFICAR` | — | 9 de 24 | 17 de 32 | 17 de 32 | **0** |
| Processos com citação registrada | 0 | 0 | 0 | 0 | **16 de 31** |
| Achados P0 abertos | — | 1 | 0 | 0 | 0 |
| Transparência LGPD | ausente | ausente | ausente | presente | presente |
| Estado sob controle de versão | não | não | **sim** | **sim** | **não** |

### 8.1 O que a série demonstra

Cinco iterações completas do ciclo de rigor da DSR, com **cada reprovação preservada** — a R1
reprovou nas quatro sub-verificações e foi commitada assim (`3212b95`). A linha mais legível para
uma banca continua sendo a do roteiro: **4 tarefas quebradas → 1 parcial → 1 parcial → nenhuma →
nenhuma.**

Dois achados metodológicos que a série produziu e que valem mais que a aprovação em si:

1. **A R2 registrou 100% de conformidade sobre uma estrutura errada.** A auditoria passou porque o
   artefato correspondia ao que o texto do TCC descrevia — e o texto descrevia mal a fonte
   primária. Uma matriz de conformidade vale o que vale a leitura da fonte que a define.
2. **A R5 mostra que uma regra de classificação pode inverter o resultado conforme o que se mede.**
   A mesma regra que promove 8 células rebaixaria outras 24, porque foi formulada para um caso
   particular e aplicada como se fosse geral. **Critério de conformidade precisa ser declarado
   antes, e por escrito** — que é precisamente a função do pré-registro.

### 8.2 O que a série NÃO demonstra

Que o artefato está pronto para coleta. A engenharia está substancialmente concluída, mas restam
três itens U1 de texto/decisão (§7.2) e um de código (§7.1). O mais importante deles não é
técnico: **enquanto o critério de A4 não estiver declarado, a taxa de conformidade da matriz é
32 PF ou 8 PF conforme a leitura** — e um número que muda por quatro vezes conforme quem o
interpreta não é um resultado pré-registrável.
