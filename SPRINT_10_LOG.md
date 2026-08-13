# SPRINT 10 — Fechamento da revisão bibliográfica e busca negativa em Biofisiológico

**Data:** 2026-08-12
**Natureza:** aplicação de decisões já tomadas por Marcus e Gabriel, com base em busca
bibliográfica concluída fora deste repositório.

**Pré-requisitos verificados:** Sociocultural com 3 processos (Suporte social, Normas de grupo,
Autoestigma) e exatamente 1 marcador `// VERIFICAR:` (item 5, Hipervigilância) — estado deixado
pelo Sprint 9.

> ## Nenhum marcador `// VERIFICAR:` permanece no código.
>
> ```
> grep -c "// VERIFICAR:" shared/eemm-processes.ts   ->   0
> ```
>
> Os 17 itens da revisão original estão resolvidos: 16 no Sprint 9, o item 5 neste. O item 18
> (Vínculo e pertencimento) nasceu já citado.

---

## 1. Item 5 — Hipervigilância (Atenção)

Foi o último item aberto, e esteve aberto por **divergência real entre as fontes-âncora**:

- **Hayes et al. (2020)** associa vigilância a **Afeto/ansiedade**
- **Ciarrochi et al. (2024)** a associa a **Atenção**

**Decisão de Marcus e Gabriel: manter a atribuição a Atenção**, priorizando a fonte mais recente
e mais diretamente focada na descrição do próprio construto.

```
source: {
  reference: "Ciarrochi, Hernández, Hill, Ong, Gloster, Levin, Yap, Fraser,
              Sahdra, Hofmann & Hayes (2024)",
  location:  "Seção sobre descompasso evolutivo com o ambiente moderno
              ('heightened vigilance and aggression')",
  verifiedBy: "Marcus e Gabriel",
  verifiedAt: "2026-08-12",
}
```

A divergência foi registrada na `description` do processo, não só na tabela: assim ela chega ao
avaliador na ajuda contextual. Quem usar o mapa vê que o ponto é disputado **e** qual foi o
critério de desempate — o que é diferente de ver uma atribuição que aparenta consenso.

---

## 2. Item 18 — Vínculo e pertencimento (Sociocultural)

Processo **novo**, criado já com citação. Repõe o quarto processo de Sociocultural, cuja vaga
ficou aberta no Sprint 9 com a remoção de "Papéis socioculturais" (decisão C4).

| Campo | Conteúdo |
|---|---|
| Nome | Vínculo e pertencimento |
| Sistema | Sociocultural |
| `reference` | Hayes, Ciarrochi, Hofmann, Chin & Sahdra (2022) |
| `location` | Discussão da extensão social do modelo de flexibilidade psicológica ("a noticing or contextual self to secure attachment and belonging") |
| `verifiedBy` / `verifiedAt` | Marcus e Gabriel / 2026-08-12 |

Descrição registrada: extensão sociocultural do processo de self contextual (nível psicológico) —
a fonte propõe explicitamente que o senso de self contextual se estende, no nível social, para
vínculo e pertencimento seguro. Distinto dos outros três processos socioculturais, com foco em
qualidade relacional/apego.

### 2.1 Um campo que o prompt não especificou

Como no Sprint 9, `typicalValence` é obrigatório no tipo e não foi fornecido. Preenchi
**`adaptive`**, com base na própria descrição ("pertencimento **seguro**"). **Não é afirmação
bibliográfica** — nenhuma fonte lhe é atribuída — mas é conteúdo exibido na ajuda contextual e
merece confirmação. Se estiver errado, é edição de uma linha.

Ficam **três** valências inferidas ao todo, aguardando confirmação: "Ação valorizada"
(`adaptive`), "Repertório comportamental" (`context_dependent`) e esta.

---

## 3. Contagem final por sistema

| Sistema | Sprint 9 | **Sprint 10** | Processos com `source` |
|---|---|---|---|
| Afeto | 5 | 5 | 3 de 5 |
| Cognição | 4 | 4 | 2 de 4 |
| Atenção | 4 | 4 | **1 de 4** (Hipervigilância, resolvida agora) |
| Self | 4 | 4 | 1 de 4 |
| Motivação | 3 | 3 | 1 de 3 |
| Comportamento Manifesto | 4 | 4 | 1 de 4 |
| Biofisiológico | 3 | **3** | **3 de 3** |
| Sociocultural | 3 | **4** | **4 de 4** |
| **Total** | **30** | **31** | **16 de 31** |

### 3.1 Os 15 processos sem `source` — o que esse número significa

**Nenhum deles é pendência deste sprint nem regressão.** São os processos que **nunca estiveram
na lista dos 17**: as atribuições consideradas incontroversas desde o Sprint 4.

```
Afeto:        Evitação experiencial, Aceitação (disposição)
Cognição:     Fusão cognitiva, Desfusão cognitiva
Atenção:      Atenção flexível ao momento presente, Rigidez atencional,
              Desengajamento atencional
Self:         Self como contexto, Self conceitualizado, Tomada de perspectiva
Motivação:    Clareza de valores, Motivação por controle aversivo
Comportamento: Ação comprometida, Rigidez comportamental, Esquiva/inação
```

Vale registrar, porém, o que a Rodada 3 da auditoria já havia dito e continua valendo: *"a
marcação sinaliza onde a dúvida é maior, não onde ela é exclusiva — a revisão vale para a lista
inteira"*. Fechar os 17 marcadores **não** significa que os 31 processos estão citados; significa
que os pontos identificados como duvidosos foram resolvidos. Se o TCC afirmar que o mapa inteiro
tem base bibliográfica registrada, isso hoje é verdade para **16 de 31**.

---

## 4. Busca por um quarto processo em Biofisiológico — resultado NEGATIVO

*(Esta seção é o conteúdo citável na Seção 5.3 do TCC.)*

Sociocultural voltou a 4 processos com o item 18. **Biofisiológico permanece com 3, por decisão
deliberada** — e o registro de por quê vale tanto quanto o dos itens que foram incluídos.

### 4.1 O que foi buscado, e onde

Busca dedicada por um quarto processo biofisiológico nas três fontes-âncora:

- Hayes et al. (2020)
- Hayes, Ciarrochi, Hofmann, Chin & Sahdra (2022)
- Ciarrochi et al. (2024)

**Critério de inclusão aplicado:** *processo de mudança caracterizável clinicamente* — algo que o
profissional possa descrever como variando, sendo selecionado, sendo retido ou se ajustando ao
contexto, dentro de uma formulação de caso.

### 4.2 O que foi encontrado, e por que foi descartado

**Único candidato adicional identificado:** o **polimorfismo 5-HTT**, discutido em Hayes,
Ciarrochi, Hofmann, Chin & Sahdra (2022) como **endofenótipo de flexibilidade psicológica**.

**Descartado.** O motivo é o critério de inclusão, não escassez de leitura: 5-HTT é **medida
correlacional de pesquisa genética, não processo modificável em contexto clínico**.

O argumento, na forma em que o artefato o expõe: os quatro operadores evolucionários pedem que o
profissional caracterize *como aquele processo varia, é selecionado, é retido, ou se adequa ao
contexto*. Um genótipo não varia dentro de uma formulação de caso, não é selecionado por
contingências no horizonte da terapia, e não se ajusta a contexto no sentido em que o modelo usa o
termo. Incluí-lo produziria **quatro células que o avaliador não teria como preencher** — e o
Sprint 7B mostrou que células estruturalmente presentes e processualmente vazias são um problema
real, não teórico.

### 4.3 Por que isto é achado, não lacuna

O resultado negativo **sustenta, com evidência de busca documentada, a hipótese já registrada no
projeto sobre subrepresentação do nível biofisiológico** na literatura de processos de mudança do
EEMM.

A forma da subrepresentação é específica e vale ser dita com precisão: as fontes-âncora **não
ignoram** o nível biofisiológico — elas o citam, e daí vieram os três processos que o mapa tem.
O que elas oferecem, porém, são majoritariamente **marcadores, medidas e correlatos** (variabilidade
da frequência cardíaca, indicadores de estresse, endofenótipos genéticos), e não **processos
formulados como manipuláveis em intervenção**. Dos três processos que sobreviveram ao critério,
um (`Estresse fisiológico`) está registrado como **confiança baixa**, com suporte de fonte única.

Ou seja: a assimetria entre os oito sistemas do EEMM não é só de quantidade de conteúdo, é de
**tipo de conteúdo disponível**. Um artefato que pede caracterização processual em todos os
sistemas encontra, no biofisiológico, uma literatura que fala sobretudo em medida.

---

## 5. Verificação ao vivo

Backend reiniciado para recarregar o mapa; ajuda contextual lida da interface real.

| # | Verificação | Resultado |
|---|---|---|
| 1 | Sociocultural exibe 4 processos, incluindo "Vínculo e pertencimento" | **4** — Suporte social, Normas de grupo, Autoestigma, **Vínculo e pertencimento** |
| 2 | Biofisiológico continua com 3 | **3** — Atividade do SNA (VFC), Estresse fisiológico, Sono (higiene do sono) |
| 3 | Atenção exibe Hipervigilância sem pendência | **4 processos**, Hipervigilância presente e **com `source`** |
| 4 | `tsc --noEmit` limpo nos dois pacotes | **exit 0** no server e no client |

Conferências complementares em `GET /api/eemm/processes`: 31 processos, 16 com `source`, todas as
8 contagens por sistema conferindo com o esperado. Caso de teste excluído ao fim, com verificação
de integridade.

---

## 6. Arquivos alterados

| Arquivo | Alteração |
|---|---|
| `shared/eemm-processes.ts` | Item 5 resolvido (`source` + marcador removido + ressalva na descrição); item 18 adicionado a Sociocultural; nota de busca negativa acima da lista de Biofisiológico |
| `docs/verificacao-processos-eemm.md` | Linha 5 preenchida; linha 18 nova; seção de busca negativa em Biofisiológico; estado final atualizado para 17/17 |

Schema, rotas e `shared/eemm-types.ts` **não foram tocados**.

---

## 7. O que fica em aberto

1. **Confirmar as três `typicalValence` inferidas** (§2.1) — não são afirmações bibliográficas,
   mas são exibidas ao avaliador.
2. **Ordem de autoria de 2024** — as quatro ocorrências de `Hofmann & Hayes (2024)` sinalizadas no
   `SPRINT_9_LOG.md` §5 seguem **não corrigidas**, aguardando autorização. A mais relevante é
   `shared/eemm-processes.ts:6`, código de produção.
3. **Classificação PA→PF na matriz (§4.8.4)** — a condição formal está satisfeita para
   Biofisiológico (3 de 3) e Sociocultural (4 de 4). **Mas Biofisiológico chegou lá com 3
   processos e uma busca negativa documentada, não com 4**, e um dos três está registrado como
   confiança baixa. É avaliação para a próxima rodada de auditoria fazer célula por célula, com a
   §4 em mãos — não consequência aritmética de "todos citados".
4. **Os 15 processos nunca marcados** (§3.1) seguem sem `source`. Não é pendência deste sprint,
   mas é o que separa "os 17 duvidosos foram resolvidos" de "o mapa inteiro tem base registrada".
