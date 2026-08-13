# Auditoria de Conformidade Metodológica (DSR/EEMM) — Rodada 6

## Auditoria de fechamento, pré-registro OSF

**Data:** 2026-08-12
**Estado auditado:** working tree após os Sprints 9, 10 e 11.
**Natureza:** diferente das rodadas anteriores, esta **não busca achados novos** — verifica, item
por item, se cada pendência da Rodada 5 foi resolvida, com evidência concreta.
**Método:** leitura de código, consulta direta ao SQLite, execução ao vivo (API `:3001`, Vite
`:5173`) e revisão do histórico Git.

> **Auditorias preservadas, nenhuma sobrescrita.** R1 (`3212b95`), R2 (`84a2e81`), R3 (`af011e4`),
> R4 (`dcf35a0`), R5 (em disco, **não commitada** — ver §1). Esta é a sexta.

> ## ⚠ RESSALVA NO TOPO — a árvore NÃO está limpa
>
> HEAD = **`46f9dc5`** (Sprint 10). **Quatro arquivos pendentes:**
>
> ```
>  M docs/verificacao-processos-eemm.md      <- correção do Sprint 11
>  M shared/eemm-processes.ts                <- correção do Sprint 11
> ?? SPRINT_11_LOG.md                        <- nunca commitado
> ?? AUDITORIA_METODOLOGIA_R5.md             <- nunca commitada
> ```
>
> **O Sprint 11 inteiro está fora do controle de versão**, e a Rodada 5 também. A auditoria foi
> completada assim mesmo, mas **nenhum resultado desta rodada é definitivo enquanto isso não for
> resolvido** — o estado verificado não corresponde a nenhum commit.
>
> É o mesmo gap que a R5 registrou e que continua aberto. É **um comando** de distância.

---

## 1. Sumário executivo

| Métrica | R1 | R2 | R3 | R4 | R5 | **R6** |
|---|---|---|---|---|---|---|
| Estrutura da matriz | 6×4 | 6×3 = 18 | 8×4 = 32 | 32 | 32 | **32** |
| Células PF / PA / AU | 0/0/18 | 0/18/0 | 24/8/0 | 24/8/0 | 32/0/0 | **32/0/0** |
| Sub-verificações reprovadas no §4.8.4 | 4 de 4 | 1 de 4 | 0 de 4 | 0 de 4 | 0 de 4 | **0 de 4** |
| Tarefas do Apêndice C que quebram | 4 + 1 parcial | 0 + 1 parcial | 0 + 1 parcial | 0 | 0 | **0 — 8/8 EXECUTA** |
| Marcadores `// VERIFICAR:` | — | 9 de 24 | 17 de 32 | 17 de 32 | 0 | **0** |
| Processos com `source` completo | — | — | — | 0 de 30 | 16 de 31 | **16 de 31** |
| Autoria da referência de 2024 | — | — | — | — | **incorreta (11 autores)** | **corrigida (2 autores)** |
| Achados P0 abertos | — | 1 | 0 | 0 | 0 | **0** |
| Estado auditado sob controle de versão | não | não | sim | sim | **não** | **não** |

---

# VEREDITO DE PRONTIDÃO PARA PRÉ-REGISTRO

**1. O estado do código está integralmente sob controle de versão?**
### NÃO
> HEAD = `46f9dc5`; 4 arquivos pendentes. O Sprint 11 (correção da autoria de 2024) e a Rodada 5 nunca foram commitados.

**2. A matriz de conformidade passa nas quatro sub-verificações do §4.8.4?**
### SIM
> 32 PF / 0 PA / 0 AU sob o critério (a); 0 marcadores `// VERIFICAR:`; as quatro sub-verificações passam (§3.3).

**3. O roteiro do Apêndice C executa 8/8 sem quebra?**
### SIM
> T1–T8 executados ponta a ponta nesta rodada, todos EXECUTA, sem nenhum "parcial" (§5).

**4. Os itens de texto do TCC foram declarados como aplicados pelo autor?**
### SIM
> Os três itens (§4.8.4 reescrito para 32 células, critério de A4 declarado, §4.10 corrigido) foram declarados aplicados. **Não verificáveis por este ambiente** — o TCC não está no repositório.

---

> ## A declaração de prontidão NÃO é emitida nesta rodada.
>
> Três das quatro respostas são SIM. A primeira é NÃO, e por isso a frase
> *"o artefato e o protocolo de avaliação estão prontos para pré-registro no OSF"* **não pode ser
> escrita aqui**.
>
> **O que falta, sem ambiguidade — apenas isto:**
>
> ```bash
> git add shared/eemm-processes.ts docs/verificacao-processos-eemm.md SPRINT_11_LOG.md AUDITORIA_METODOLOGIA_R5.md AUDITORIA_METODOLOGIA_R6.md && git commit -m "Sprint 11 e auditorias R5/R6"
> ```
>
> Nenhum outro item bloqueia. Feito o commit e confirmada a árvore limpa, as quatro respostas
> passam a SIM e a declaração pode ser emitida — sem necessidade de nova rodada de verificação
> substantiva, porque os Blocos 2 a 7 desta auditoria já cobrem o conteúdo desses arquivos.

---

## 2. Bloco 1 — Rastreabilidade de versão

| Verificação | Resultado |
|---|---|
| `git status` árvore limpa | **NÃO** — 4 arquivos pendentes |
| HEAD | **`46f9dc5`** — "Sprint 10: resolucao do item 5, quarto processo de Sociocultural, decisao de segregacao de dados" |
| Sprint 9 commitado | **SIM** — `371e07d`, sem alterações pendentes |
| Sprint 10 commitado | **SIM** — `46f9dc5`, sem alterações pendentes |
| **Sprint 11 commitado** | **NÃO** — `SPRINT_11_LOG.md` não rastreado; as duas correções em disco não commitadas |
| Rodada 5 commitada | **NÃO** — `AUDITORIA_METODOLOGIA_R5.md` não rastreado |

### 2.1 Observação sobre a mensagem do commit `371e07d`

A mensagem do commit do Sprint 9 contém a autoria incorreta:

> "Sprint 9: propagacao bibliografica de 16 dos 17 itens VERIFICAR (Hayes et al. 2020, 2022;
> **Ciarrochi et al. 2024**)"

Corrigi-la exigiria reescrever histórico já publicado. **Recomendação: não reescrever.** O
`SPRINT_11_LOG.md` documenta o erro e a correção; uma mensagem de commit histórica que contém o
erro é registro fiel do que se acreditava naquele momento, que é o que o histórico serve para
guardar. Registrado aqui para que ninguém a cite como referência bibliográfica.

---

## 3. Bloco 2 — Correção da citação de 2024 (Sprint 11)

### 3.1 Atribuições incorretas

| Arquivo | `Ciarrochi et al. (2024)` | `Ciarrochi et al., 2024` | Forma de 11 autores |
|---|---|---|---|
| `shared/eemm-processes.ts` | **0** | **0** | **0** |
| `docs/verificacao-processos-eemm.md` | 1 | **0** | 1 |

As duas ocorrências em `docs/` são **a própria nota explicativa** (linhas 38–39), que cita a forma
errada para declará-la errada — mesmo padrão da nota de 2022. **Nenhuma atribuição incorreta em
uso.**

> **Nota sobre o grep pedido.** `grep "Ciarrochi" | grep "2024"` por **linha** retorna 4 + 4
> ocorrências, e todas são **falso positivo**: são as referências duplas
> `"Hayes, Ciarrochi, Hofmann, Chin & Sahdra (2022); Hofmann & Hayes (2024)"`, onde "Ciarrochi"
> pertence ao 2022 — que está correto e deve permanecer. A verificação válida é por **string de
> atribuição**, feita acima.

### 3.2 Forma correta em uso

| Verificação | Resultado |
|---|---|
| `Hofmann & Hayes (2024)` em `shared/eemm-processes.ts` | **11 ocorrências** |
| `Hofmann & Hayes (2024)` em `docs/verificacao-processos-eemm.md` | **14 ocorrências** |
| Forma completa `Hofmann, S. G., & Hayes, S. C. (2024)` na nota canônica | **presente** |
| Referência de 2022 preservada intacta | **11 + 13 ocorrências** |

### 3.3 Nota explicativa

**Presente**, `docs/verificacao-processos-eemm.md:34` — seção *"Forma canônica da referência de
2024 — corrigida no Sprint 11"*. Declara: a forma correta de dois autores; que a de onze foi erro
de pesquisa dos Sprints 9–10, de fonte indexada incorretamente e não conferida contra a entrada
oficial da revista; e que a correção foi confirmada contra a lista de Referências do TCC.

### 3.4 Escopo da correção — `location` e `description`

Diff completo de `shared/eemm-processes.ts` inspecionado linha a linha:

| O que mudou | Quantidade |
|---|---|
| Campos `reference` | 10 linhas |
| Comentário da busca negativa (`Ciarrochi et al., 2024` → `Hofmann & Hayes, 2024`) | 1 linha |
| Descrição da Hipervigilância — **apenas o nome dos autores** | 1 linha |
| **Campos `location`** | **0 — nenhum alterado** |
| Nomes de processo, `typicalValence`, `verifiedBy`, `verifiedAt` | **0** |

A única `description` tocada mudou exclusivamente `Ciarrochi et al. (2024)` → `Hofmann & Hayes
(2024)`; o restante da frase é idêntico caractere a caractere. Conteúdo bibliográfico (caso Mora,
Figura 3, Tabela 2, seções) preservado — 5 + 6 ocorrências de "caso Mora", inalteradas.

**Escopo respeitado.**

---

## 4. Bloco 3 — Matriz de conformidade sob o critério (a)

**Critério (a), adotado por Marcus e Gabriel:** a conformidade de A4 é avaliada pela **ausência de
pendências de conferência bibliográfica no sistema**, não pela citação individualizada de cada
processo.

### 4.1 Pré-condição

```
grep -c "// VERIFICAR:" shared/eemm-processes.ts   ->   0
```

Zero, mantido desde a R5.

### 4.2 Matriz 8 × 4 final

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

**Níveis Adicionais (2 sistemas — 8 células)**

| Sistema | Variação | Seleção | Retenção | Adequação ao Contexto |
|---|---|---|---|---|
| **Biofisiológico** | ✓/✓/✓/✓ → **PF** | ✓/✓/✓/✓ → **PF** | ✓/✓/✓/✓ → **PF** | ✓/✓/✓/✓ → **PF** |
| **Sociocultural** | ✓/✓/✓/✓ → **PF** | ✓/✓/✓/✓ → **PF** | ✓/✓/✓/✓ → **PF** | ✓/✓/✓/✓ → **PF** |

### **32 PF / 0 PA / 0 AU** — reproduz exatamente o resultado da R5. Nenhuma divergência a investigar.

Base factual: A1 verificado ao vivo (64 registros, 32 células, grid 8×4 renderizado); A2 nos
rótulos dos 8 sistemas e 4 operadores, todos vindos de `shared/eemm-types.ts`; A3 pela constraint
`UNIQUE(patient_id, system, operator, valence)`, com coexistência das duas valências confirmada em
T2/T3; A4 sob o critério (a), sem pendências de conferência em nenhum sistema.

### 4.3 As quatro sub-verificações do critério a priori

| Verificação | Resultado |
|---|---|
| Taxa (PF+PA)/32 ≥ 80% (≥26) | **PASSA — 32/32 = 100%**, 32 PF, 0 PA, 0 AU |
| Nenhum sistema AU nos 4 operadores | **PASSA** — nenhuma célula AU |
| As 24 células dos 6 sistemas dimensionais são PF/PA | **PASSA — 24/24 PF** |
| Cada um dos 4 operadores com A4 satisfeito em ≥1 sistema | **PASSA** — verificado ao vivo em variação (Afeto), seleção (Cognição, Sociocultural), retenção (Comportamento Manifesto), contexto (Biofisiológico) |

**Veredito: PASSA nas quatro.**

### 4.4 Ressalvas de qualidade que acompanham a taxa de 100%

Não alteram a classificação sob o critério (a), mas devem constar no texto sempre que a taxa for
citada:

1. **16 de 31 processos** têm `source`; os outros 15 nunca estiveram entre os 17 duvidosos. "O
   mapa tem base bibliográfica registrada" é verdade para 16 de 31.
2. **`Estresse fisiológico`** está registrado como **confiança baixa** — fonte única.
3. **`Normas de grupo`** e **`Autoestigma`** têm sobreposição declarada com Cognição e Self.
4. **Biofisiológico tem 3 processos**, com busca negativa documentada para um quarto (5-HTT
   descartado por ser medida correlacional, não processo modificável).

---

## 5. Bloco 4 — Itens de texto do TCC

O documento do TCC **não está no repositório**. Os três itens abaixo foram declarados pelo autor
como aplicados; esta auditoria **não pode confirmá-los**.

| # | Item | Status |
|---|---|---|
| 1 | §4.8.4 reescrito para 32 células (8 sistemas × 4 operadores), incluindo Tabela 3, Tabela 4, critério a priori e Seção 5.3 recalculada | **CONFIRMADO PELO AUTOR, NÃO VERIFICÁVEL NO REPOSITÓRIO** |
| 2 | §4.8.4 com parágrafo declarando o critério de A4 adotado (critério "a": ausência de pendências de conferência) | **CONFIRMADO PELO AUTOR, NÃO VERIFICÁVEL NO REPOSITÓRIO** |
| 3 | §4.10 com redação corrigida: "término de sessão" → expiração por tempo desde a criação do caso | **CONFIRMADO PELO AUTOR, NÃO VERIFICÁVEL NO REPOSITÓRIO** |

**Sinalização, sem atenuação:** a validade do pré-registro depende de essas três declarações serem
verdadeiras. Nenhuma foi verificada aqui, e nenhuma pode ser verificada por este ambiente. O item
3 é o mais fácil de conferir e o mais exposto: a página `/privacidade` do artefato afirma
*"contados a partir do momento em que ele foi criado"*, e um examinador pode contrastá-la com o
§4.10 em segundos.

---

## 6. Bloco 5 — Roteiro do Apêndice C, verificação final ao vivo

Executado ponta a ponta, sem interrupção. **Resultado binário, sem "parcial".**

| # | Tarefa | Resultado | Evidência |
|---|---|---|---|
| **T1** | Criar caso | **EXECUTA** | "Sessao de inspecao R6" (id=20); matriz devolve 64 registros / 32 células |
| **T2** | Registrar processo adaptativo | **EXECUTA** | `affect × variation × adaptive`, escore 4 + caracterização — HTTP 200 |
| **T3** | Registrar desadaptativo na **mesma célula** | **EXECUTA** | `affect × variation × maladaptive`, escore 8 — HTTP 200; as duas linhas coexistem |
| **T4** | Cobrir múltiplos sistemas/operadores | **EXECUTA** | +4 registros em Cognição×Seleção, Comportamento×Retenção, Biofisiológico×Contexto, Sociocultural×Seleção — 4× HTTP 200 |
| **T5** | Consultar ajuda contextual | **EXECUTA** | **Biofisiológico** (3): Atividade do SNA (VFC), Estresse fisiológico, Sono (higiene do sono). **Sociocultural** (4): Suporte social, Normas de grupo, Autoestigma, Vínculo e pertencimento. Conteúdo próprio de cada sistema |
| **T6** | Editar registro anterior | **EXECUTA** | Adaptativo de Afeto×Variação editado in place; **valência irmã intacta** (escore 8, nota original) |
| **T7** | Gerar formulação final | **EXECUTA** | 6 registros em 5 de 8 sistemas; disclaimer presente (377 car.); 3 sistemas não avaliados **declarados**; **varredura HC3: 0 ocorrências** nas sentenças geradas |
| **T8** | Localizar retenção **e** excluir caso | **EXECUTA** | `/privacidade` com TTL "4 horas", intervalo "15 minutos" e aviso de dado fictício; link presente também no modal de exclusão; exclusão registrou `caso id=20 eliminado e verificado: patients=0, eemm_cells=0` |

### **8 de 8 EXECUTA. Nenhuma quebra, nenhum parcial.** Console do navegador sem erros.

---

## 7. Bloco 6 — Governança de dados, verificação final

| Verificação | Resultado |
|---|---|
| Tabelas no banco | `eemm_cells`, `patients`, `sqlite_sequence` — nenhuma residual |
| `eemm_cells_legacy_backup` | **ausente** (eliminada no Sprint 5) |
| `eemm_cells_legacy_backup_v2` | **ausente** (nunca criada); coberta por `purge.ts` caso venha a existir |
| Dado retido após a sessão | **nenhum** — `patients: 0`, `eemm_cells: 0` |
| Purga com verificação pós-exclusão | **funcionando** — log confirma eliminação verificada em cascata |
| `docs/decisions/segregacao-dados-pesquisa.md` | **presente e commitado** |
| Coerência da decisão com o código | **confirmada** — 0 ocorrências de `feedback`/`evaluator`/`sus_`/`questionario` |
| `.gitignore` cobre `*.sqlite*` | **sim** — linhas 57–60 (`*.sqlite`, `-shm`, `-wal`, `*.sqlite3`) |
| Arquivos `.sqlite` rastreados | **0** |

---

## 8. Bloco 7 — Inventário de pendências não-bloqueantes (backlog pós-pré-registro)

Confirmação de status apenas; não é escopo desta rodada resolvê-los.

| # | Item | Urgência | Status |
|---|---|---|---|
| 1 | `docker build` / `docker run` reais | U2 | **PENDENTE** — Dockerfile presente, nunca construído |
| 2 | Responsividade (breakpoints Tailwind) | U2 | **PENDENTE** — 0 breakpoints em todo `client/src` |
| 3 | "Severidade" aplicada a processo adaptativo (HC2) | U2 | **PENDENTE** — coluna `severity_score` e rótulos inalterados |
| 4 | Indicador de progresso geral `x/64` | U2 | **PENDENTE** — só existe o contador de caracterização do Sprint 7B; a única menção a `x/64` no código é um comentário dizendo que está previsto |
| 5 | Validação por schema (`zod`) | U2 | **PENDENTE** — ausente das dependências |
| 6 | Erros diferenciados (HU9) | U2 | **PENDENTE** — 7 ocorrências de `"Internal server error"` genérico |
| 7 | Undo / histórico por célula (HU3) | U2 | **PENDENTE** — ausente |
| 8 | Busca/filtro na lista (HU7) | U3 | **PENDENTE** — ausente |
| 9 | Defeito cosmético `.".` na formulação | U3 | **PENDENTE** — correção de uma linha em `composeSentence()` |
| 10 | Limpeza de `lib/` e `artifacts/` | U3 | **PENDENTE** — `lib/` sem nenhuma importação, ainda em disco |
| 11 | Corrigir a ocorrência de autoria errada em `AUDITORIA_METODOLOGIA_R5.md` | U3 | **PENDENTE** — 1 ocorrência; recomendado antes de commitar a R5 |
| 12 | 3 `typicalValence` inferidas, não confirmadas pelos autores | U2 | **PENDENTE** — Ação valorizada, Repertório comportamental, Vínculo e pertencimento |
| 13 | 15 de 31 processos sem `source` | U2 | **PENDENTE** — decisão de texto: citá-los ou declarar o escopo da conferência |

**Nenhum destes bloqueia o pré-registro.** Os itens 12 e 13 são de decisão/texto e afetam como a
matriz é descrita, não o resultado dela.

---

## 9. Comparativo entre as seis rodadas — para a Atividade 3

| Dimensão | R1 | R2 | R3 | R4 | R5 | **R6** |
|---|---|---|---|---|---|---|
| Estrutura vs. Hayes et al. (2020) Fig. 1 | 6×4, nomenclatura alheia | 6×3 — leitura equivocada | 8×4 — fiel | fiel | fiel | fiel |
| Células PF / PA / AU | 0/0/18 | 0/18/0 | 24/8/0 | 24/8/0 | 32/0/0 | **32/0/0** |
| Sub-verificações reprovadas | 4 de 4 | 1 de 4 | 0 de 4 | 0 de 4 | 0 de 4 | **0 de 4** |
| Tarefas do Apêndice C que quebram | 4 + 1 parcial | 0 + 1 parcial | 0 + 1 parcial | **0** | **0** | **0** |
| Marcadores `VERIFICAR` | — | 9 de 24 | 17 de 32 | 17 de 32 | **0** | **0** |
| Achados P0 abertos | — | 1 | 0 | 0 | 0 | **0** |
| Erros de citação conhecidos | — | — | — | — | **1 (autoria 2024)** | **0 — corrigido** |
| Estado sob controle de versão | não | não | **sim** | **sim** | não | **não** |

### 9.1 O que a série de seis rodadas demonstra

Seis iterações completas do ciclo de rigor da DSR, com **cada reprovação preservada** — a R1
reprovou nas quatro sub-verificações e foi commitada assim. As duas linhas mais legíveis para uma
banca:

- **Roteiro:** 4 tarefas quebradas → 1 parcial → 1 parcial → nenhuma → nenhuma → **nenhuma**
- **Matriz:** 0 conformes → 18 PA → 24 PF/8 PA → 24 PF/8 PA → 32 PF → **32 PF**

Três achados metodológicos que a série produziu, e que valem mais para o texto do que a aprovação:

1. **A R2 registrou 100% de conformidade sobre uma estrutura errada** — o artefato correspondia ao
   que o TCC descrevia, e o TCC descrevia mal a fonte primária.
2. **A R5 mostrou que uma regra de classificação pode inverter o resultado** conforme o que se
   mede: a mesma regra que promovia 8 células rebaixaria outras 24.
3. **O Sprint 11 mostrou que uma verificação pode ser confiante e errada** — o Sprint 9 auditou o
   repositório contra uma autoria incorreta e sinalizou a forma **correta** como erro. A retenção
   de autorização para correções fora de escopo impediu que o erro se propagasse.

### 9.2 O que a série não demonstra

Que o pré-registro pode ser feito hoje. **Três das quatro condições estão satisfeitas**; a
primeira — estado sob controle de versão — não está, e é a mais barata de resolver. E as três
declarações de texto do §4 permanecem **fora do alcance de verificação deste ambiente**: se
alguma delas não for verdadeira, o pré-registro trava um protocolo que não corresponde ao
artefato.
