# SPRINT 9 — Propagação das decisões de rastreabilidade bibliográfica

**Data:** 2026-08-12
**Natureza:** aplicação de decisões **já tomadas** por Marcus e Gabriel, com base em pesquisa
bibliográfica concluída fora deste repositório. Nenhuma decisão de sistema, nome ou citação foi
pesquisada, questionada ou ajustada por este sprint.

**Pré-requisitos verificados:** campo `source` presente no tipo `ChangeProcess`
(`ProcessSource`, linha 70; `source?: ProcessSource`, linha 105) e
`docs/verificacao-processos-eemm.md` existente — ambos criados no Sprint 8.

**Escopo:** 16 dos 17 itens marcados. O **item 5 (Hipervigilância)** não foi tocado.

---

## 1. Contagem de processos por sistema — antes e depois

| Sistema | Antes | Depois | Δ | O que mudou |
|---|---|---|---|---|
| Afeto | 4 | **5** | +1 | Recebeu `Interocepção` (C3) |
| Cognição | 4 | 4 | 0 | Só citações |
| Atenção | 4 | 4 | 0 | **Intocado** — contém o item 5 |
| Self | 4 | 4 | 0 | Só citação (item 6) |
| Motivação | 4 | **3** | −1 | Perdeu itens 7 (C1) e 8 (C5); ganhou "Ação valorizada" (C2) |
| Comportamento Manifesto | 4 | 4 | 0 | Item 9 substituído pelo processo fundido (C5) |
| Biofisiológico | 4 | **3** | −1 | Perdeu `Interocepção` para Afeto (C3); 3 renomeações |
| Sociocultural | 4 | **3** | −1 | Perdeu `Papéis socioculturais` (C4); 1 renomeação |
| **Total** | **32** | **30** | **−2** | 4 removidos, 2 adicionados, 1 movido |

Aritmética: 32 − 4 removidos (itens 7, 8, 9, 17) + 2 adicionados ("Ação valorizada", processo
fundido) = 30. `Interocepção` mudou de sistema, sem efeito no total.

**Processos com `source` preenchido: 14 de 30.** Os 16 itens em escopo produziram 14 processos
sobreviventes com citação — os itens 7 e 8 não geraram processo próprio (7 foi substituído por
C2, 8 foi absorvido por C5) e o item 17 foi removido sem substituto.

---

## 2. Marcadores restantes

```
grep -c "// VERIFICAR:" shared/eemm-processes.ts   ->   1
```

O único marcador remanescente é o do item 5, **Hipervigilância** (Atenção), confirmado por
inspeção. Caiu de **17 para 1**, como especificado.

Isso **não é descuido deste sprint**: as fontes-âncora divergem entre si sobre o sistema correto
— Hayes et al. (2020) aponta para Afeto, Ciarrochi et al. (2024) aponta para Atenção — e a
decisão está pendente de revisão por Marcus e Gabriel.

---

## 3. O que foi aplicado, por grupo

### Grupo A — propagação direta (3 itens)

| # | Processo | Sistema | Ação |
|---|---|---|---|
| 6 | Autocrítica | Self | `source` + marcador removido |
| 14 | Suporte social | Sociocultural | `source` + ressalva na descrição + marcador removido |
| 15 | Normas de grupo | Sociocultural | `source` + ressalva na descrição + marcador removido |

### Grupo B — propagação com ajuste de nome (7 itens)

| # | Nome anterior | Nome atual | Sistema |
|---|---|---|---|
| 1 | Supressão emocional | **Supressão (regulação emocional)** | Afeto |
| 2 | *(mantido)* | Consciência emocional | Afeto |
| 3 | *(mantido)* | Ruminação / preocupação perseverativa | Cognição |
| 4 | *(mantido)* | Comportamento governado por regras | Cognição |
| 10 | Regulação autonômica | **Atividade do sistema nervoso autônomo (variabilidade da frequência cardíaca)** | Biofisiológico |
| 11 | Reatividade de estresse fisiológico | **Estresse fisiológico** | Biofisiológico |
| 12 | Regulação do ritmo circadiano e do sono | **Sono (higiene do sono)** | Biofisiológico |
| 16 | Estigma e estigma internalizado | **Autoestigma** | Sociocultural |

Ressalvas de conteúdo acrescentadas ao campo `description` (não ao `source`) nos itens 2, 3, 11,
12, 14, 15 e 16 — assim chegam ao avaliador na ajuda contextual, e não só a quem lê a tabela.

### Grupo C — mudanças estruturais (5 decisões)

| ID | Decisão | Resultado |
|---|---|---|
| C1 | Remover "Hierarquização de objetivos" | Motivação perde o item 7 |
| C2 | Adicionar "Ação valorizada (valores como base motivacional)" | Motivação ganha processo com `source` |
| C3 | Mover "Interocepção" de Biofisiológico para Afeto | Afeto 4→5, Biofisiológico 4→3 |
| C4 | Remover "Papéis socioculturais" sem substituto | Sociocultural 4→3 |
| C5 | Fundir "Rigidez motivacional" + "Repertório de habilidades" | Um processo em Comportamento Manifesto; Motivação perde o item 8 |

**Justificativa de C4, para registro:** *"A única fonte que aborda o conceito o trata
exclusivamente como descritor de contexto clínico, nunca como processo de mudança nomeado — não
atende ao critério de inclusão no mapa."* É o único item cuja verificação **rejeitou** a inclusão
em vez de confirmá-la.

---

## 4. Dois campos que o prompt não especificou

O tipo `ChangeProcess` exige `typicalValence`, e as especificações de C2 e C5 forneceram nome,
descrição e `source`, mas não a valência. Como o campo é **obrigatório** no tipo, omiti-lo
quebraria a compilação. Preenchi assim:

| Processo | Valor | Base |
|---|---|---|
| Ação valorizada (valores como base motivacional) | `adaptive` | Coerência com a descrição fornecida ("estabelece reforçadores intrínsecos e orienta ação comprometida") e com "Clareza de valores", o processo irmão em Motivação, já `adaptive` |
| Repertório comportamental (amplitude e flexibilidade) | `context_dependent` | Herdado de "Repertório de habilidades", o item do sistema sobrevivente na fusão, que já era `context_dependent` |

**Sinalizado por não ser decisão minha para tomar.** Não é afirmação bibliográfica — nenhum dos
dois valores é atribuído a fonte — mas é conteúdo exibido ao avaliador na ajuda contextual e
merece confirmação de Marcus e Gabriel. Se qualquer um dos dois estiver errado, é edição de uma
linha.

---

## 5. Ordem de autoria incorreta — ocorrências sinalizadas, NÃO corrigidas

A forma canônica é **`Hayes, Ciarrochi, Hofmann, Chin & Sahdra (2022)`**, usada em todos os
campos `source` deste sprint.

**Busca por `Hayes, Hofmann & Ciarrochi (2022)` no repositório: nenhuma ocorrência.**

Foi encontrado, porém, um padrão adjacente que merece a mesma sinalização: a obra de **2024** é
citada em quatro lugares como **`Hofmann & Hayes (2024)`**, forma que — comparada à referência
completa fornecida neste prompt, `Ciarrochi, Hernández, Hill, Ong, Gloster, Levin, Yap, Fraser,
Sahdra, Hofmann & Hayes (2024)` — **omite nove coautores e inverte a ordem de autoria**, colocando
como primeiros autores os dois últimos da lista real.

| Arquivo | Linha | Trecho |
|---|---|---|
| `shared/eemm-processes.ts` | 6 | "Base teórica: Hayes et al. (2020, 2022); **Hofmann & Hayes (2024)**" |
| `SPRINT_4_LOG.md` | 28 | "**Hofmann & Hayes (2024)** antes da Atividade 5" |
| `SPRINT_5_LOG.md` | 399 | "(2020, 2022) e **Hofmann & Hayes (2024)**" |
| `SPRINT_8_LOG.md` | 87 | "nem a **Hofmann & Hayes (2024)**" |

**Nenhuma foi corrigida**, conforme a instrução de não alterar arquivos fora do escopo deste
prompt sem autorização — inclusive a ocorrência em `shared/eemm-processes.ts`, que é um arquivo
que este sprint editou: a autorização era para propagar `source`, não para reescrever o cabeçalho.

**Recomendação:** corrigir ao menos a de `shared/eemm-processes.ts:6`, que é código de produção e
a mais visível. As três em logs de sprint são registro histórico; corrigi-las é opcional e
discutível, já que reescrever um log muda o que ele registrou.

Duas ocorrências que o `grep` acusa e que **não** são erro: a referência completa do item 6
termina em "…Sahdra, Hofmann & Hayes (2024)" — está correta —, e a nota em
`docs/verificacao-processos-eemm.md:30` cita a forma incorreta justamente para declará-la
incorreta.

---

## 6. Verificação ao vivo

Backend reiniciado para recarregar o mapa. Ajuda contextual lida da interface real, abrindo o
painel e o botão `?` de cada sistema:

| # | Verificação pedida | Resultado |
|---|---|---|
| 1 | Afeto exibe 5 processos, incluindo Interocepção | **5** — Evitação experiencial, Aceitação (disposição), Supressão (regulação emocional), Consciência emocional, **Interocepção** |
| 2 | Biofisiológico exibe 3 (perdeu Interocepção) | **3** — Atividade do sistema nervoso autônomo (VFC), Estresse fisiológico, Sono (higiene do sono) |
| 3 | Motivação exibe 3 (perdeu dois, ganhou um) | **3** — Clareza de valores, Motivação por controle aversivo, **Ação valorizada** |
| 4 | Comportamento Manifesto exibe 4, com o fundido | **4** — Ação comprometida, Rigidez comportamental, Esquiva comportamental / inação, **Repertório comportamental (amplitude e flexibilidade)** |
| 5 | Sociocultural exibe 3 (perdeu Papéis socioculturais) | **3** — Suporte social, Normas de grupo, **Autoestigma** |
| 6 | `tsc --noEmit` limpo | **exit 0** no server e no client |

Conferências complementares no endpoint `GET /api/eemm/processes`: 30 processos, 14 com `source`,
`Interocepção` presente em `affect` e ausente de `biophysiological`, `Papéis socioculturais`
ausente. Caso de teste excluído ao fim, com verificação de integridade.

---

## 7. Efeito na matriz de conformidade (§4.8.4) — o que NÃO se pode presumir

> **A promoção de células de PA para PF exige que TODOS os processos do sistema tenham `source`
> preenchido. Este sprint torna essa condição verdadeira para Biofisiológico e Sociocultural, mas
> por um caminho que a próxima auditoria precisa avaliar explicitamente, não presumir.**

O estado literal:

| Sistema | Processos | Com `source` | Condição formal |
|---|---|---|---|
| Biofisiológico | 3 | **3 de 3** | satisfeita |
| Sociocultural | 3 | **3 de 3** | satisfeita |

A ressalva é que **a condição passou a ser satisfeita em parte por redução do denominador, não só
por preenchimento de lacuna**. Biofisiológico tinha 4 processos, dos quais 0 com citação; agora
tem 3, todos citados — mas um deles (`Interocepção`) saiu do sistema em vez de ser verificado
nele, e **não houve substituto**. Sociocultural perdeu `Papéis socioculturais` porque a fonte não
o sustenta, também **sem substituto**.

Ou seja: os dois sistemas hoje cobrem menos terreno conceitual do que cobriam antes. Isso pode ser
o resultado correto — remover conteúdo sem base é melhor do que mantê-lo —, mas significa que
"todos os processos citados" e "o sistema está adequadamente representado" **deixaram de ser a
mesma pergunta**. Três outras coisas pesam na mesma direção:

1. O item **11 (Estresse fisiológico)** está marcado como **confiança baixa** — fonte única, sem
   terminologia técnica nas fontes-âncora. Tem `source`, mas o próprio registro declara o suporte
   como fraco.
2. Os itens **12 e 13** são sustentados apenas por `Ciarrochi et al. (2024)`, e o 13 saiu do
   sistema.
3. O item **16** tem sobreposição declarada com Self, e o **15** com Cognição — o que afeta a
   distintividade dos processos de Sociocultural.

**Portanto: a promoção em bloco de Biofisiológico e Sociocultural de PA para PF não está
automaticamente justificada por este sprint.** É decisão para a próxima rodada de auditoria
avaliar **célula por célula**, com o critério explícito, e não consequência aritmética de
"3 de 3 citados".

O sistema **Atenção** permanece sem alteração de status: contém o item 5, ainda em aberto.

---

## 8. Arquivos alterados

| Arquivo | Alteração |
|---|---|
| `shared/eemm-processes.ts` | 16 itens propagados; 4 removidos, 2 adicionados, 1 movido de sistema; 14 campos `source` preenchidos; 16 marcadores removidos |
| `docs/verificacao-processos-eemm.md` | 16 linhas com as 4 colunas de citação; coluna "Desfecho" nova, para rastrear renomeações, remoções, fusão e reatribuição; linha 5 mantida vazia |

`shared/eemm-types.ts`, rotas e schema **não foram tocados** — a mudança é de conteúdo do mapa,
não de estrutura.

---

## 9. Próximo passo

1. **Decidir o item 5 (Hipervigilância)** — Afeto ou Atenção. É o único item aberto; resolvê-lo
   leva o contador a zero.
2. **Confirmar os dois `typicalValence`** inferidos na §4.
3. **Autorizar (ou não) a correção da ordem de autoria** em `shared/eemm-processes.ts:6` (§5).
4. **Rodada 5 de auditoria** — avaliar explicitamente, célula por célula, se Biofisiológico e
   Sociocultural migram de PA para PF, com a ressalva da §7 em mãos.
