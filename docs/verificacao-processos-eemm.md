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
- **Localização (p./seção/figura)** — o ponto **exato** dentro da fonte. Ex.: `Figura 1, p. 12`
  ou `Tabela 2, seção 3.4`. A referência identifica a obra; a localização é o que permite a um
  terceiro reabrir a fonte e conferir a mesma coisa. Uma linha com referência e sem localização
  **não conta como verificada**.
- **Verificado por** — nome de quem conferiu. Ex.: `Marcus`.
- **Data** — data ISO da conferência. Ex.: `2026-08-13`.

Se a consulta à fonte **não confirmar** a atribuição atual, não preencha a linha como se
confirmasse: anote o achado na coluna de localização (ex.: `NÃO CONFIRMADO — fonte trata como
subtipo de X`) e trate como mudança de conteúdo no mapa, não como verificação concluída.

---

## Estado atual

**0 de 17 verificados.** Todos os 17 marcadores `// VERIFICAR:` seguem no código.

Os itens abaixo são exatamente os listados em [SPRINT_5_LOG.md](../SPRINT_5_LOG.md) §5 — 9
herdados do Sprint 4 e 8 criados no Sprint 5. Numeração e nomes copiados de lá, sem alteração.

---

## Herdados do Sprint 4 (itens 1–9)

Dúvida de atribuição a **sistema**: o processo existe na literatura, mas a qual dos oito
sistemas ele pertence não é inequívoco.

| # | Processo | Sistema | Referência (autor, ano) | Localização (p./seção/figura) | Verificado por | Data |
|---|---|---|---|---|---|---|
| 1 | Supressão emocional | Afeto | | | | |
| 2 | Consciência emocional | Afeto | | | | |
| 3 | Ruminação / preocupação perseverativa | Cognição | | | | |
| 4 | Comportamento governado por regras | Cognição | | | | |
| 5 | Hipervigilância | Atenção | | | | |
| 6 | Autocrítica | Self | | | | |
| 7 | Hierarquização de objetivos | Motivação | | | | |
| 8 | Rigidez motivacional | Motivação | | | | |
| 9 | Repertório de habilidades | Comportamento Manifesto | | | | |

## Novos no Sprint 5 (itens 10–17)

Conteúdo escrito no Sprint 5, **sem base de atribuição prévia no repositório**. Para estes, a
dúvida não é só a qual sistema pertencem, mas se figuram como processo de mudança na fonte.

| # | Processo | Sistema | Referência (autor, ano) | Localização (p./seção/figura) | Verificado por | Data |
|---|---|---|---|---|---|---|
| 10 | Regulação autonômica | Biofisiológico | | | | |
| 11 | Reatividade de estresse fisiológico | Biofisiológico | | | | |
| 12 | Regulação do ritmo circadiano e do sono | Biofisiológico | | | | |
| 13 | Interocepção | Biofisiológico | | | | |
| 14 | Suporte social | Sociocultural | | | | |
| 15 | Normas de grupo | Sociocultural | | | | |
| 16 | Estigma e estigma internalizado | Sociocultural | | | | |
| 17 | Papéis socioculturais | Sociocultural | | | | |

---

## Dúvida específica de cada item

Reproduzida de [SPRINT_5_LOG.md](../SPRINT_5_LOG.md) §5 e dos comentários `// VERIFICAR:` no
código, para que a conferência possa ser feita a partir deste arquivo sem abrir os outros dois.
**É esta dúvida que precisa ser respondida pela fonte** — não basta encontrar o processo
mencionado em algum lugar da obra.

| # | O que precisa ser confirmado |
|---|---|
| 1 | Parte da literatura trata supressão como subtipo de evitação experiencial, não como processo distinto |
| 2 | Fronteira com atenção (atenção dirigida ao estado interno) não é nítida |
| 3 | Pode ser processo de atenção (perseveração atencional) em vez de cognição |
| 4 | *Pliance* tem componente social forte; poderia ser motivação ou sociocultural |
| 5 | Fronteira com afeto (ativação relacionada à ameaça) |
| 6 | Poderia ser cognição (conteúdo avaliativo) em vez de self |
| 7 | Envolve enquadramento relacional hierárquico; poderia ser cognição |
| 8 | Sobreposição conceitual com rigidez comportamental |
| 9 | A literatura o trata ora como processo, ora como resultado de outros processos |
| 10 | Se a fonte a trata como processo de mudança do sistema ou como *medida* (índice fisiológico) de flexibilidade atribuída a outro sistema |
| 11 | Terminologia da fonte (resposta de estresse / carga alostática / reatividade do eixo HPA são tratadas de modos distintos) e se a polaridade desadaptativa se sustenta |
| 12 | Se a fonte trata sono como processo biofisiológico próprio ou como comportamento manifesto (higiene de sono) |
| 13 | Fronteira explícita com atenção (direcionamento ao corpo) e afeto (consciência emocional) |
| 14 | Se a fonte distingue suporte *disponível* de suporte *percebido* (que teria componente cognitivo) e qual dos dois é o processo |
| 15 | Sobreposição direta com "comportamento governado por regras"; se a fonte separa a norma como contingência sociocultural do controle verbal que ela exerce |
| 16 | Estigma público é sociocultural, mas o internalizado se sobrepõe a self conceitualizado; se são um processo ou dois |
| 17 | Se figura como processo de mudança na fonte ou apenas como descritor de contexto — só o primeiro caberia nesta lista |

---

## Depois de preencher

Esta tabela é a **entrada** do sprint de propagação, que é etapa separada e ainda não executada.
Com as linhas preenchidas, aquele sprint fará, item a item e apenas para os itens verificados:

1. preencher o campo `source` do processo correspondente em `shared/eemm-processes.ts`;
2. remover o comentário `// VERIFICAR:` daquele item;
3. atualizar a contagem de itens pendentes nos logs e na próxima rodada de auditoria.

Itens que continuarem sem linha preenchida **mantêm** o marcador. A propagação é por item, não
em bloco: verificar 5 dos 17 remove 5 marcadores e deixa 12.

> **Nota sobre a integridade deste registro.** Nenhuma das quatro últimas colunas foi
> pré-preenchida por inferência, aproximação ou plausibilidade. Uma citação de página fabricada
> é pior do que uma lacuna visível: a lacuna se resolve consultando a fonte, a citação falsa
> sobrevive à revisão e contamina o que se apoiar nela. Se uma linha aparecer preenchida, é
> porque alguém abriu a fonte.
