# Rastreabilidade bibliográfica — processos de mudança do EEMM

Este arquivo é o registro auditável de que cada atribuição sistema→processo no mapa
`shared/eemm-processes.ts` foi conferida contra a literatura fonte, não apenas julgada
plausível por juízo clínico geral. Preencha as quatro últimas colunas para cada linha à medida
que a verificação for concluída, com a localização exata (página, seção ou figura) da fonte
consultada. Uma linha sem essas colunas preenchidas significa que o item ainda não tem base
citável, e o marcador `// VERIFICAR` correspondente em `shared/eemm-processes.ts` deve
permanecer no código até que esta tabela seja completada.

---

## Como preencher

- **Referência (autor, ano)** — a fonte consultada, na forma curta. Ex.: `Hayes et al. (2020)`.
- **Localização (p./seção/figura)** — o ponto **exato** dentro da fonte. Ex.: `Figura 1, p. 12`.
  A referência identifica a obra; a localização é o que permite a um terceiro reabrir a fonte e
  conferir a mesma coisa. Uma linha com referência e sem localização **não conta como
  verificada**.
- **Verificado por** — nome de quem conferiu. **Data** — data ISO da conferência.

Se a consulta à fonte **não confirmar** a atribuição atual, não preencha a linha como se
confirmasse: anote o achado e trate como mudança de conteúdo no mapa, não como verificação
concluída. Foi o que ocorreu com os itens 7, 8, 9, 13 e 17 no Sprint 9 — ver a coluna
"Desfecho".

### Forma canônica da referência de 2022

**`Hayes, Ciarrochi, Hofmann, Chin & Sahdra (2022)`** — sempre nesta ordem de autoria. A forma
`Hayes, Hofmann & Ciarrochi (2022)` está **incorreta** (omite dois coautores e altera a ordem) e
não deve ser usada. Esta nota **não foi afetada** pela correção de 2024 descrita abaixo: são
obras distintas.

### Forma canônica da referência de 2024 — corrigida no Sprint 11

**`Hofmann & Hayes (2024)`** — **dois autores**, `Hofmann, S. G., & Hayes, S. C. (2024)`.

A forma de **onze autores** usada nos Sprints 9 e 10 — `Ciarrochi, Hernández, Hill, Ong, Gloster,
Levin, Yap, Fraser, Sahdra, Hofmann & Hayes (2024)` — e sua abreviação `Ciarrochi et al. (2024)`
**estavam erradas**. Foi **erro de pesquisa bibliográfica**, introduzido na propagação dos
Sprints 9–10: a autoria veio de uma fonte indexada incorretamente e **não foi conferida contra a
entrada oficial da revista**.

A forma correta foi **confirmada contra a lista de Referências do TCC pelos próprios autores do
trabalho** e propagada a todas as ocorrências no Sprint 11.

**O que a correção NÃO altera:** nenhuma `location`, nenhuma descrição de processo e nenhuma
decisão de atribuição sistema→processo. O conteúdo bibliográfico citado — estudo de caso Mora,
Figura 3, Tabela 2, seções — **permanece válido**; o que estava errado era exclusivamente a
autoria da obra.

> **Nota de rigor.** O `SPRINT_9_LOG.md` §5 sinalizou `Hofmann & Hayes (2024)` como "ordem de
> autoria incorreta" e recomendou corrigi-la em `shared/eemm-processes.ts:6`. **Aquela
> sinalização estava errada — a forma apontada como incorreta era a correta.** A recomendação
> nunca foi executada porque a autorização foi retida, o que impediu que o erro se propagasse
> também para o cabeçalho do arquivo. Ver `SPRINT_11_LOG.md` §3.

---

## Estado atual

**17 de 17 resolvidos** — 16 no Sprint 9, o item 5 no Sprint 10. **Nenhum marcador
`// VERIFICAR:` permanece no código.**

```
grep -c "// VERIFICAR:" shared/eemm-processes.ts   ->   0
```

O Sprint 10 acrescentou ainda o **item 18** (Vínculo e pertencimento), que não vem da revisão
original: é processo novo, com citação desde a criação, que repõe o quarto processo de
Sociocultural perdido com a remoção do item 17.

As decisões dos itens 7, 8, 9, 13 e 17 não foram apenas propagação de citação: houve remoção,
fusão e reatribuição de sistema. A coluna **Desfecho** registra o que aconteceu com cada um, para
que a numeração original (do `SPRINT_5_LOG.md` §5) continue rastreável mesmo onde o processo
mudou de nome, de sistema ou deixou de existir.

---

## Itens 1–9 (herdados do Sprint 4)

| # | Processo (estado atual) | Sistema | Desfecho | Referência (autor, ano) | Localização (p./seção/figura) | Verificado por | Data |
|---|---|---|---|---|---|---|---|
| 1 | Supressão (regulação emocional) | Afeto | renomeado (era "Supressão emocional") | Hayes, Ciarrochi, Hofmann, Chin & Sahdra (2022) | Tabela 1, entrada do Emotion Regulation Questionnaire (ERQ) | Marcus e Gabriel | 2026-08-12 |
| 2 | Consciência emocional | Afeto | mantido | Hayes, Ciarrochi, Hofmann, Chin & Sahdra (2022) | Tabela 1, entrada do Five Facet Mindfulness Questionnaire (fator Observe) | Marcus e Gabriel | 2026-08-12 |
| 3 | Ruminação / preocupação perseverativa | Cognição | mantido | Hayes, Ciarrochi, Hofmann, Chin & Sahdra (2022); Hofmann & Hayes (2024) | BRT 2022, Tabela 1 (Rumination-Reflection Questionnaire, Penn State Worry Questionnaire); JPI 2024, subseção de Atenção do caso Mora | Marcus e Gabriel | 2026-08-12 |
| 4 | Comportamento governado por regras | Cognição | mantido | Hayes, Ciarrochi, Hofmann, Chin & Sahdra (2022) | Seção 1, discussão de pesquisa em Relational Frame Theory | Marcus e Gabriel | 2026-08-12 |
| 5 | Hipervigilância | Atenção | mantido — divergência entre fontes resolvida por decisão (ver nota abaixo) | Hofmann & Hayes (2024) | Seção sobre descompasso evolutivo com o ambiente moderno ("heightened vigilance and aggression") | Marcus e Gabriel | 2026-08-12 |
| 6 | Autocrítica | Self | mantido | Hofmann & Hayes (2024) | Tabela 2 (linha de Compassion-Focused Therapy) e estudo de caso Mora ("I blame myself and cannot treat myself with compassion") | Marcus e Gabriel | 2026-08-12 |
| 7 | — *(removido)* | Motivação | **REMOVIDO** (C1); slot ocupado por "Ação valorizada (valores como base motivacional)" (C2) | Hayes, Ciarrochi, Hofmann, Chin & Sahdra (2022) | Seção 2.3 ("Pillar 3: engagement"); Tabela 1, entradas do Valued Living Questionnaire e do Engaged Living Scale | Marcus e Gabriel | 2026-08-12 |
| 8 | — *(fundido no item 9)* | Motivação → Comportamento Manifesto | **FUNDIDO** (C5) com o item 9 | Hayes et al. (2020); Hayes, Ciarrochi, Hofmann, Chin & Sahdra (2022) | Hayes et al. 2020, Seção 2.3; Hayes et al. 2022, Seção 2.1, discussão do Pilar 1 | Marcus e Gabriel | 2026-08-12 |
| 9 | Repertório comportamental (amplitude e flexibilidade) | Comportamento Manifesto | **FUNDIDO** (C5): absorve o item 8; era "Repertório de habilidades" | Hayes et al. (2020); Hayes, Ciarrochi, Hofmann, Chin & Sahdra (2022) | Hayes et al. 2020, Seção 2.3; Hayes et al. 2022, Seção 2.1, discussão do Pilar 1 | Marcus e Gabriel | 2026-08-12 |

## Itens 10–17 (criados no Sprint 5)

| # | Processo (estado atual) | Sistema | Desfecho | Referência (autor, ano) | Localização (p./seção/figura) | Verificado por | Data |
|---|---|---|---|---|---|---|---|
| 10 | Atividade do sistema nervoso autônomo (variabilidade da frequência cardíaca) | Biofisiológico | renomeado (era "Regulação autonômica") | Hayes, Ciarrochi, Hofmann, Chin & Sahdra (2022); Hofmann & Hayes (2024) | BRT 2022, Seção 3, discussão do nível biofisiológico; JPI 2024, lista de exemplos do nível biológico/fisiológico | Marcus e Gabriel | 2026-08-12 |
| 11 | Estresse fisiológico | Biofisiológico | renomeado (era "Reatividade de estresse fisiológico"); **confiança baixa** | Hofmann & Hayes (2024) | Estudo de caso Mora, avaliação multinível | Marcus e Gabriel | 2026-08-12 |
| 12 | Sono (higiene do sono) | Biofisiológico | renomeado (era "Regulação do ritmo circadiano e do sono") | Hofmann & Hayes (2024) | Estudo de caso Mora, etapa de planejamento de tratamento | Marcus e Gabriel | 2026-08-12 |
| 13 | Interocepção | **Afeto** (era Biofisiológico) | **REATRIBUÍDO** (C3) | Hofmann & Hayes (2024) | Figura 3, comparação entre ACT e terapia psicodinâmica | Marcus e Gabriel | 2026-08-12 |
| 14 | Suporte social | Sociocultural | mantido | Hayes, Ciarrochi, Hofmann, Chin & Sahdra (2022); Hofmann & Hayes (2024) | BRT 2022, Tabela 1, entrada da Medical Outcomes Study Social Support Survey; JPI 2024, Tabela 4 e caso Mora, etapa 4 | Marcus e Gabriel | 2026-08-12 |
| 15 | Normas de grupo | Sociocultural | mantido | Hayes, Ciarrochi, Hofmann, Chin & Sahdra (2022); Hofmann & Hayes (2024) | BRT 2022, Tabela 1, entrada do Drinking Norms Rating Form; JPI 2024, seção sobre o nível relações/cultura | Marcus e Gabriel | 2026-08-12 |
| 16 | Autoestigma | Sociocultural | renomeado (era "Estigma e estigma internalizado") | Hayes, Ciarrochi, Hofmann, Chin & Sahdra (2022) | Seção 1.1, lista de aplicações iniciais da ACT | Marcus e Gabriel | 2026-08-12 |
| 17 | — *(removido)* | Sociocultural | **REMOVIDO** (C4) — a única fonte que aborda o conceito o trata exclusivamente como descritor de contexto clínico, nunca como processo de mudança nomeado | — | — | Marcus e Gabriel | 2026-08-12 |

## Item 18 (acrescentado no Sprint 10)

Não faz parte da revisão original dos 17. É processo **novo**, criado já com citação — repõe o
quarto processo de Sociocultural, cuja vaga ficou aberta com a remoção do item 17.

| # | Processo | Sistema | Desfecho | Referência (autor, ano) | Localização (p./seção/figura) | Verificado por | Data |
|---|---|---|---|---|---|---|---|
| 18 | Vínculo e pertencimento | Sociocultural | **ADICIONADO** (Sprint 10) | Hayes, Ciarrochi, Hofmann, Chin & Sahdra (2022) | Discussão da extensão social do modelo de flexibilidade psicológica ("a noticing or contextual self to secure attachment and belonging") | Marcus e Gabriel | 2026-08-12 |

> O item 17 é o único cuja verificação **rejeitou** a inclusão no mapa em vez de confirmá-la. As
> colunas de Referência e Localização ficam com `—` de propósito: não há citação que sustente o
> processo, e é exatamente esse o achado. Quem conferiu e quando permanecem preenchidos, porque a
> conferência ocorreu.

---

## Ressalvas de conteúdo registradas na verificação

Anotadas também no campo `description` do processo correspondente, para que cheguem ao avaliador
na ajuda contextual e não só a quem lê este arquivo.

| # | Ressalva |
|---|---|
| 2 | A fonte codifica o mediador simultaneamente em Afeto e Atenção; não há resolução única para um só sistema nas fontes-âncora |
| 3 | Sobreposição documentada com o sistema Atenção |
| 11 | Confiança baixa — suporte restrito a uma única fonte, sem terminologia técnica de reatividade nas fontes-âncora |
| 12 | "Ritmo circadiano" não aparece nas fontes-âncora; o conceito sustentado é sono como alvo comportamental de intervenção |
| 14 | Nenhuma das fontes distingue suporte disponível de percebido; o instrumento citado mede exclusivamente percepção por autorrelato |
| 15 | As fontes não separam a norma social do controle verbal que ela exerce (sobreposição com o item 4) |
| 16 | Fonte trata exclusivamente como "self-stigma"; sem suporte para estigma público como processo distinto. Sobreposição possível com Self |

---

## Item 5 — como a divergência entre fontes foi resolvida

**Hipervigilância** foi o último item em aberto, e esteve em aberto **por divergência real entre
as fontes-âncora**, não por descuido:

- **Hayes et al. (2020)** associa vigilância a **Afeto/ansiedade**.
- **Hofmann & Hayes (2024)** a associa a **Atenção**.

**Decisão de Marcus e Gabriel (Sprint 10): manter a atribuição a Atenção**, priorizando a fonte
mais recente e mais diretamente focada na descrição do próprio construto. A divergência está
registrada na `description` do processo, de modo que chega ao avaliador na ajuda contextual em vez
de ficar só neste arquivo — quem usar o mapa vê que o ponto é disputado e qual foi o critério de
desempate.

---

## Busca por um quarto processo em Biofisiológico — resultado NEGATIVO justificado

Sociocultural voltou a ter 4 processos com o item 18. **Biofisiológico permanece com 3, por
decisão deliberada**, e o registro dessa decisão importa tanto quanto os que a acompanham.

Busca dedicada nas três fontes-âncora — Hayes et al. (2020); Hayes, Ciarrochi, Hofmann, Chin &
Sahdra (2022); Hofmann & Hayes (2024) — **não encontrou um quarto processo que atenda ao critério
de "processo de mudança caracterizável clinicamente"**.

**Único candidato adicional identificado:** o **polimorfismo 5-HTT**, discutido em Hayes,
Ciarrochi, Hofmann, Chin & Sahdra (2022) como endofenótipo de flexibilidade psicológica.

**Descartado**, e o motivo é o critério de inclusão do mapa, não escassez de leitura: 5-HTT é
**medida correlacional de pesquisa genética, não processo modificável em contexto clínico**. Um
genótipo não é algo que o profissional caracterize como variando, sendo selecionado ou retido
dentro de uma formulação de caso — o que é precisamente o que os quatro operadores evolucionários
pedem. Incluí-lo produziria uma célula que o avaliador não teria como preencher.

**Este é um achado, não uma lacuna do trabalho.** Ele sustenta, com evidência de busca
documentada, a hipótese já registrada no projeto sobre **subrepresentação do nível biofisiológico
na literatura de processos de mudança do EEMM**: as fontes-âncora oferecem exemplos
biofisiológicos, mas raramente na forma de processos clinicamente manipuláveis. Ver
`SPRINT_10_LOG.md` §4 para o registro completo, citável na Seção 5.3 do TCC.

---

## Estado final da revisão

Os 17 itens da revisão original estão resolvidos; o item 18 nasceu citado. **Nenhum marcador
`// VERIFICAR:` permanece.**

O que continua em aberto **não é citação**, e sim decisão de classificação: se os sistemas
Biofisiológico e Sociocultural migram de PA para PF na matriz de conformidade (§4.8.4). A
condição formal ("todos os processos do sistema com `source`") está satisfeita para os dois — mas
Biofisiológico chegou lá com 3 processos e uma busca negativa documentada, não com 4. Isso é
avaliação para a próxima rodada de auditoria fazer **célula por célula**, com a nota acima em
mãos, não consequência aritmética.

> **Nota sobre a integridade deste registro.** Nenhuma das colunas de citação foi preenchida por
> inferência ou plausibilidade. Todas vêm de decisões tomadas por Marcus e Gabriel com base em
> pesquisa bibliográfica concluída fora deste repositório.
