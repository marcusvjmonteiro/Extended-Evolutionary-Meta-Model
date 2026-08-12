# Sprint 4 — Ajuda contextual (T5), formulação final (T7) e processos de mudança (1d)

**Data:** 2026-08-11
**Escopo:** fechar os dois últimos pontos de quebra críticos do roteiro do Apêndice C — T5 (ajuda
contextual no ponto de uso) e T7 (geração de formulação final) — e implementar o objetivo funcional
1(d) (referências aos processos de mudança por dimensão), pré-requisito de conteúdo para T5.

**Pré-requisitos verificados antes de iniciar:** Sprint 1 (`shared/eemm-types.ts` com os 3 níveis e
`VALENCES`; schema com `UNIQUE(patient_id, dimension, level, valence)`), Sprint 2 (`artifacts/` com
apenas `mockup-sandbox`; sqlite fora do tracking), Sprint 3 (`deleteCaseAndVerify`,
`purgeExpiredCases`, `startPurgeScheduler` presentes em `server/src/services/purge.ts`).

---

## 1. Parte A — Mapa de processos de mudança

Criado [shared/eemm-processes.ts](shared/eemm-processes.ts): 24 processos, 4 por dimensão, cada um
com nome em PT-BR, descrição operacional curta e valência típica
(`adaptive` | `maladaptive` | `context_dependent`).

`context_dependent` foi usado onde a literatura não sustenta polaridade fixa (comportamento
governado por regras, desengajamento atencional, hierarquização de objetivos, repertório de
habilidades) — forçar polaridade nesses casos distorceria a fonte.

### 1.1 ATRIBUIÇÕES MARCADAS COMO `VERIFICAR` — revisar antes da coleta real

**Esta é a lista que precisa de conferência por leitura direta de Hayes et al. (2020, 2022) e
Hofmann & Hayes (2024) antes da Atividade 5.** São 8 de 24 processos. Cada um está marcado no
código-fonte com o comentário `// VERIFICAR: atribuição a confirmar contra a literatura fonte antes
de uso na coleta de dados real`.

| # | Processo | Dimensão atribuída | Dúvida específica |
|---|---|---|---|
| 1 | Supressão emocional | Afeto | Parte da literatura trata supressão como subtipo de evitação experiencial, não como processo distinto no EEMM |
| 2 | Consciência emocional | Afeto | Fronteira com a dimensão de atenção (atenção dirigida ao estado interno) não é nítida |
| 3 | Ruminação / preocupação perseverativa | Cognição | Pode ser lida como processo da dimensão de **atenção** (perseveração atencional) |
| 4 | Comportamento governado por regras | Cognição | *Pliance* tem componente social forte; poderia ser motivação ou nível sociocultural |
| 5 | Hipervigilância | Atenção | Fronteira com afeto (componente de ativação relacionada à ameaça) |
| 6 | Autocrítica | Self | Poderia ser cognição (conteúdo avaliativo) |
| 7 | Hierarquização de objetivos | Motivação | Envolve enquadramento relacional hierárquico; poderia ser cognição |
| 8 | Rigidez motivacional | Motivação | Sobreposição conceitual com rigidez comportamental (comportamento manifesto) |

Os 16 processos restantes (evitação experiencial, aceitação, fusão/desfusão cognitiva, atenção
flexível ao presente, rigidez atencional, self como contexto, self conceitualizado, tomada de
perspectiva, clareza de valores, motivação por controle aversivo, ação comprometida, rigidez
comportamental, esquiva/inação, e a valência `context_dependent` de desengajamento atencional e
repertório de habilidades) têm atribuição dimensional razoavelmente incontroversa na literatura de
ACT/PBT, mas **a revisão vale para a lista inteira** — a marcação sinaliza onde a dúvida é maior,
não onde ela é exclusiva.

### 1.2 SEGUNDA LIMITAÇÃO — viés de nível, mais grave que a anterior

O EEMM é uma matriz **dimensão × nível**. Este mapa indexa **apenas por dimensão**, e os processos
mais documentados na literatura de PBT/ACT são de **nível psicológico**.

Consequência concreta e observada na verificação ao vivo: ao abrir a ajuda numa célula de nível
**biofisiológico** ou **sociocultural**, o avaliador vê processos de nível psicológico. Na
verificação da Seção 4.1, a ajuda da célula Afeto × Psicológico exibiu corretamente os processos de
afeto — mas a mesma lista seria exibida em Afeto × Biofisiológico, onde processos como reatividade
autonômica ou ritmo circadiano seriam os pertinentes, e em Afeto × Sociocultural, onde caberiam
normas de expressão emocional ou suporte social.

**Isto é um problema de validade de conteúdo, não cosmético**, e precisa ser resolvido antes da
coleta: ou reindexando o mapa por dimensão × nível (18 listas em vez de 6), ou sinalizando a
limitação na própria interface. Não foi resolvido neste sprint por estar além do escopo autorizado.

### 1.3 Terminologia

Não há tradução canônica consolidada do EEMM em português. Os termos seguem o uso corrente na
literatura brasileira de ACT/RFT, e também merecem revisão por especialista.

### 1.4 Endpoint (Passo A2)

`GET /api/eemm/processes` serve o **mapa completo** numa única resposta, em vez de aceitar
`?dimension=X`.

**Justificativa:** o mapa é estático, imutável em runtime e pequeno (24 processos). Servi-lo inteiro
permite ao frontend buscá-lo uma única vez na montagem da página e renderizar a ajuda a partir do
estado local. Um filtro por dimensão implicaria requisição a cada abertura de painel — latência e
estado de carregamento exatamente no momento em que o profissional precisa da definição, o que
contraria o propósito de HU10. O endpoint também serve as definições operacionais de valência, pelo
mesmo motivo (HU6).

---

## 2. Parte B — T5, ajuda contextual

Implementada como **painel colapsável dentro do próprio painel de edição de célula**, acionado por
um botão `?` ao lado do título de cada seção. Tailwind puro, nenhuma dependência de UI nova.

Decisão de posicionamento: dentro do painel lateral já aberto, não como modal separado nem link
externo. A heurística HU10 exige a definição acessível "sem exigir saída do fluxo" — verificado na
Seção 4.1: a URL permanece `/patients/7/eemm` com a ajuda aberta.

Conteúdo, replicado nas **duas** seções e sempre referido explicitamente à valência da seção que o
contém:

1. **Definição operacional da valência daquela seção** — a seção "Adaptativo" mostra a definição de
   adaptativo, a "Desadaptativo" mostra a de desadaptativo. Não há um bloco único ambíguo sobre qual
   metade da célula cobre.
2. **Processos de mudança da dimensão da célula**, com nome, valência típica e descrição.
3. Uma ressalva de que a valência indicada é a associação típica na literatura, **não** uma
   classificação do caso — o registro da valência na célula é do avaliador.

---

## 3. Parte C — T7, formulação final

### 3.1 Backend

[server/src/services/formulation.ts](server/src/services/formulation.ts) —
`generateFormulation(patientId)`, composição template-based determinística. Sem LLM, sem síntese,
sem inferência. O módulo abre com as cinco regras que qualquer alteração futura precisa preservar,
incluindo a proibição explícita de introduzir modelo generativo para "melhorar a fluidez".

Template, com três variantes conforme os dados disponíveis:

| Situação | Sentença |
|---|---|
| escore + notas | `Na dimensão de [D], em nível [N], foi registrado processo [V] com severidade [S]/10. Notas do avaliador: "[verbatim]".` |
| escore, sem notas | `Na dimensão de [D], em nível [N], foi registrado processo [V] com severidade [S]/10.` |
| notas, sem escore | `Na dimensão de [D], em nível [N], foi registrado processo [V] sem escore de severidade atribuído. Notas do avaliador: "[verbatim]".` |

Dimensões sem registro recebem aviso explícito, nunca omissão silenciosa:

> Dimensão não avaliada nesta sessão. A ausência de registro não equivale a ausência de processo:
> significa apenas que nenhum dado foi inserido para esta dimensão.

Rota `GET /api/patients/:id/formulation` retorna **JSON de blocos por dimensão**, e não markdown ou
texto plano. Motivo: cada sentença fica isolada em seu bloco, o que torna possível testar
automaticamente a conformidade com HC3 sem reparsear prosa — como feito na Seção 4.3.

### 3.2 Frontend

[client/src/pages/Formulation.tsx](client/src/pages/Formulation.tsx), rota
`/patients/:id/formulation`, alcançável pelo botão "Gerar Formulação Final" no cabeçalho de
`EEMMForm.tsx`. O aviso de escopo é renderizado em bloco âmbar com borda esquerda destacada e corpo
de texto em tamanho normal — peso visual proporcional à sua função de proteção, não letra miúda de
rodapé. Blocos por dimensão na mesma ordem fixa do grid.

### 3.3 Rota-fallback (Passo C3)

[client/src/pages/NotFound.tsx](client/src/pages/NotFound.tsx) e rota `*` em
[client/src/App.tsx](client/src/App.tsx). Elimina o comportamento de tela em branco identificado na
auditoria.

---

## 4. Passo D — Verificação ao vivo

Caso de teste com dimensões preenchidas e vazias, exercitando as três variantes do template:
Afeto (2 células, escore + notas), Cognição (escore sem notas), Self (notas sem escore); Atenção,
Motivação e Comportamento Manifesto deliberadamente não preenchidas.

### 4.1 T5 — ajuda contextual

| Verificação | Resultado |
|---|---|
| Botão de ajuda presente em ambas as seções | sim — `Adaptativo` e `Desadaptativo` |
| URL permanece na matriz com a ajuda aberta | `/patients/7/eemm` — sem saída do fluxo |
| Definição de valência específica por seção | seção Adaptativo: *"…amplia o repertório da pessoa e a aproxima de direções que ela valoriza."*; seção Desadaptativo: *"…estreita o repertório da pessoa ou a afasta de direções que ela valoriza."* |
| Processos da dimensão exibidos | Afeto → Evitação experiencial, Aceitação (disposição), Supressão emocional, Consciência emocional |

### 4.2 T7 — texto gerado, na íntegra

Saída completa de `GET /api/patients/7/formulation`, transcrita sem edição:

```
=========================================================
AVISO DE CABECALHO:
Este documento é uma compilação estruturada dos dados inseridos pelo profissional
responsável, organizados segundo o Extended Evolutionary Meta-Model. Não constitui
diagnóstico, não sugere conduta terapêutica, e não deve ser interpretado como
inferência causal entre os processos registrados. A interpretação clínica é de
responsabilidade exclusiva do profissional que o gerou.
=========================================================
Resumo: 4 registro(s) em 3 de 6 dimensoes
=========================================================

## Afeto  [assessed=true]
  - Na dimensão de Afeto, em nível Psicológico, foi registrado processo adaptativo
    com severidade 6/10. Notas do avaliador: "Nomeia e permanece em contato com a
    emocao sem tentar suprimi-la".
  - Na dimensão de Afeto, em nível Psicológico, foi registrado processo desadaptativo
    com severidade 9/10. Notas do avaliador: "Afasta-se de situacoes que evoquem o
    afeto".

## Cognição  [assessed=true]
  - Na dimensão de Cognição, em nível Biofisiológico, foi registrado processo
    desadaptativo com severidade 4/10.

## Atenção  [assessed=false]
  (nao avaliada) Dimensão não avaliada nesta sessão. A ausência de registro não
  equivale a ausência de processo: significa apenas que nenhum dado foi inserido
  para esta dimensão.

## Self  [assessed=true]
  - Na dimensão de Self, em nível Sociocultural, foi registrado processo adaptativo
    sem escore de severidade atribuído. Notas do avaliador: "Sustenta a propria
    perspectiva em contextos de grupo".

## Motivação  [assessed=false]
  (nao avaliada) Dimensão não avaliada nesta sessão. A ausência de registro não
  equivale a ausência de processo: significa apenas que nenhum dado foi inserido
  para esta dimensão.

## Comportamento Manifesto  [assessed=false]
  (nao avaliada) Dimensão não avaliada nesta sessão. A ausência de registro não
  equivale a ausência de processo: significa apenas que nenhum dado foi inserido
  para esta dimensão.
```

Conferências sobre este texto:

- **Cabeçalho presente e sem alteração** — idêntico, caractere a caractere, à constante
  `FORMULATION_DISCLAIMER`.
- **Dados exatos** — escores 6, 9 e 4 conferem com o banco; notas reproduzidas verbatim, inclusive
  a ausência de acentuação tal como digitada no teste ("emocao", "situacoes", "propria"), o que
  confirma que não houve normalização nem reescrita.
- **Dimensões não preenchidas declaradas explicitamente** — Atenção, Motivação e Comportamento
  Manifesto aparecem com o aviso, não omitidas.
- **Ordem fixa** — a mesma das 6 dimensões no grid.

### 4.3 Confirmação de HC3, categoria por categoria

Verificação automatizada sobre o texto **gerado pelo sistema** (sentenças + avisos de dimensão não
avaliada). As notas verbatim foram excluídas da varredura porque são texto do próprio avaliador, não
produção do sistema; o cabeçalho também foi excluído porque sua função é justamente **negar** essas
categorias ("Não constitui diagnóstico, não sugere conduta terapêutica…"), e incluí-lo produziria
falso positivo.

**1. Inferência causal — AUSENTE.** Nenhum dos 17 termos testados ocorre no texto gerado: *leva a,
causa, provoca, resulta em, em consequência, consequentemente, por isso, o que explica, devido a,
porque, portanto, associado a, relacionado a, influencia, decorre, gera*. Estruturalmente, cada uma
das 4 sentenças começa com "Na dimensão de" (verificado programaticamente: `true`) e descreve uma
única célula. Nenhuma sentença inicia com pronome anafórico que pudesse referenciar a sentença
anterior (`Isso`, `Isto`, `Esse`, `Este`, `Tal`, `O que` — verificado: nenhuma ocorrência). As duas
sentenças de Afeto — uma adaptativa e uma desadaptativa na mesma célula — aparecem justapostas sem
nenhum conectivo entre elas, que é exatamente o ponto onde uma síntese tenderia a inserir "por outro
lado" ou "apesar disso".

**2. Sugestão de conduta — AUSENTE.** Nenhum dos 14 termos testados ocorre: *recomenda, sugere-se,
deve-se, indica-se, intervenção, tratamento, técnica, próximo passo, trabalhar, abordar, considerar*
(e variantes sem acento). O texto não contém nenhum verbo no imperativo nem nenhuma construção
deôntica. Não há seção de "recomendações", "plano" ou "próximos passos" — e o formato de saída
(blocos por dimensão, fixos) não tem onde acomodar uma.

**3. Linguagem diagnóstica — AUSENTE.** Nenhum dos 13 termos testados ocorre: *indica, sugere,
compatível com, consistente com, transtorno, síndrome, quadro de, diagnóstic-, patolog-, sintoma,
comorbid-*. Nenhum nome de condição clínica aparece em nenhum ponto. O único vocabulário
classificatório do documento é o do próprio metamodelo (dimensão, nível, valência adaptativa/
desadaptativa) e o escore numérico que o avaliador inseriu — nenhum dos quais constitui rótulo
diagnóstico.

Resultado consolidado da varredura: **HC3 APROVADO**, 0 falhas em 44 variantes de termos.

Ressalva honesta sobre o alcance desta verificação: ela testa o texto gerado **por este caso de
teste**. Como a geração é determinística e o vocabulário do sistema é fechado (as sentenças só
variam nos rótulos de dimensão/nível/valência, no escore e nas notas verbatim do usuário), o
resultado generaliza para qualquer entrada — mas o único componente que o sistema não controla é o
conteúdo das notas do avaliador, que são reproduzidas como escritas. **Se o avaliador escrever uma
inferência causal na nota, ela aparecerá na formulação** — corretamente atribuída a ele, entre
aspas, como "Notas do avaliador". Isso é deliberado: censurar ou reescrever a nota do profissional
seria uma violação maior do que reproduzi-la com atribuição clara.

### 4.4 Rota-fallback e regressões

| Verificação | Resultado |
|---|---|
| `/patients/:id/formulation` | renderiza o documento; não é mais tela em branco |
| `/rota/que/nao/existe` | exibe "404 — Página não encontrada" + link de retorno |
| Console do navegador | sem erros |
| `tsc --noEmit` strict, `server/` | exit 0 |
| `tsc --noEmit` strict, `client/` | exit 0 |
| Exclusão do caso de teste (Sprint 3) | `{"deleted":true,"verified":true,"patientId":7,"remaining":{"patients":0,"eemm_cells":0}}` |

---

## 5. Nota para o texto do TCC

A partir deste sprint, **as 8 tarefas do roteiro do Apêndice C são percorríveis sem quebra**.
Situação por tarefa, comparando o estado da auditoria inicial com o atual:

| Tarefa | Auditoria inicial | Após Sprints 1–4 |
|---|---|---|
| T1 — criar caso | executa | executa |
| T2 — afeto adaptativo, nível psicológico | **quebra** (sem controle de valência; nível "psicológico" inexistente) | executa (Sprint 1) |
| T3 — afeto desadaptativo, mesma célula | **quebra** (constraint sobrescrevia o registro anterior) | executa (Sprint 1) |
| T4 — demais dimensões nos 3 níveis | parcial (matriz com 4 níveis errados) | executa (Sprint 1) |
| T5 — ajuda no ponto de uso | **quebra** (zero conteúdo de ajuda) | executa (Sprint 4) |
| T6 — editar registro anterior | executa | executa |
| T7 — gerar formulação final | **quebra** (rota inexistente, tela em branco) | executa (Sprint 4) |
| T8 — localizar info de armazenamento e excluir | parcial (exclusão funcionava; info inexistente) | exclusão com verificação (Sprint 3); **info de armazenamento ainda ausente** |

**Condição que não existia antes dos Sprints 1–4:** a Atividade 5 (inspeção por especialistas) agora
tem um roteiro executável de ponta a ponta. Antes, um avaliador travaria em T2 — a segunda tarefa do
roteiro — e as quatro tarefas quebradas contaminariam qualquer julgamento de severidade que
dependesse de completar a tarefa.

**Ressalva que precisa acompanhar essa afirmação:** T8 continua parcial. A exclusão funciona e agora
é verificada, mas a informação sobre local de armazenamento e retenção — a primeira metade da
tarefa — ainda não existe na interface. O Sprint 3 criou a política (TTL de 4 horas) que essa tela
precisaria comunicar; a tela em si permanece no backlog U2.

---

## 6. Arquivos criados e alterados

### Criados
| Arquivo | Conteúdo |
|---|---|
| `shared/eemm-processes.ts` | 24 processos por dimensão, valências típicas, definições operacionais de valência |
| `server/src/routes/processes.ts` | `GET /api/eemm/processes` |
| `server/src/services/formulation.ts` | `generateFormulation()`, `FORMULATION_DISCLAIMER`, template determinístico |
| `server/src/routes/formulation.ts` | `GET /api/patients/:id/formulation` |
| `client/src/pages/Formulation.tsx` | Página da formulação com aviso destacado |
| `client/src/pages/NotFound.tsx` | Rota-fallback |
| `SPRINT_4_LOG.md` | Este documento |

### Alterados
| Arquivo | Mudança |
|---|---|
| `server/src/index.ts` | Monta os routers de processos e formulação |
| `client/src/pages/EEMMForm.tsx` | Busca o mapa de processos; ajuda colapsável em cada seção de valência; botão "Gerar Formulação Final" |
| `client/src/App.tsx` | Rotas `/patients/:id/formulation` e `*` |

---

## 7. O que permanece aberto

- **Reindexação do mapa de processos por dimensão × nível** (Seção 1.2) — validade de conteúdo,
  resolver antes da coleta
- **Revisão das 8 atribuições marcadas `VERIFICAR`** (Seção 1.1) por leitura direta da literatura
  fonte
- **Tela de transparência de armazenamento/retenção (LGPD)** — completa a metade faltante de T8
- Itens U2 restantes: indicador de progresso, responsividade, validação por schema (Zod)
- Sinalizações do Sprint 2: `lib/` órfão, `artifacts/mockup-sandbox`, validação do deploy no Replit
- Afirmação do §4.10 sobre **segregação entre dados operacionais e dados de pesquisa** — a estrutura
  de feedback dos avaliadores continua inexistente no schema
