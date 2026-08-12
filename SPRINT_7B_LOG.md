# SPRINT 7B — Indicador visual de célula não caracterizada (atributo A4)

**Data:** 12 de agosto de 2026
**Escopo:** sinalizar, sem bloquear, registros que têm escore de severidade e nenhuma
caracterização processual — o campo de notas que sustenta o atributo **A4** do critério de
conformidade do §4.8.4.

**Gap de origem (Rodada 3 da auditoria, §4.3):** o artefato oferta A4 nas 32 células e não o
exige em nenhuma. Um PUT com `severity_score: 6` e `notes: null` era aceito com HTTP 200, e
**nada na interface distinguia uma célula caracterizada de uma apenas pontuada**. Um avaliador
que preenchesse só os sliders produziria formulação estruturalmente completa e processualmente
vazia, sem que nada sinalizasse.

**Pré-requisito verificado:** `shared/eemm-types.ts` com `System`/`Operator`/`Valence` e o eixo
único de 8 sistemas; `client/src/pages/EEMMForm.tsx` com o grid 8×4 (`SYSTEM_GROUPS` ×
`OPERATORS`) e o painel lateral de duas seções de valência.

**Escopo respeitado:** um único arquivo alterado — `client/src/pages/EEMMForm.tsx`
(+142/−4). Schema, `routes/eemm.ts` e `services/formulation.ts` **não foram tocados**;
`git status` confirma.

---

## 1. Lógica de detecção

Predicado único, em `EEMMForm.tsx`, aplicado sobre o dado já carregado de `GET .../eemm`:

```ts
function isUncharacterized(
  severityScore: number | null,
  notes: string | null
): boolean {
  return severityScore !== null && (notes === null || notes.trim() === "");
}
```

Cálculo **local**, sobre as até 64 entradas já em memória. **Nenhum endpoint novo, nenhum campo
novo no schema, nenhuma chamada extra ao backend.**

Derivações a partir dele:

| Nível | Regra |
|---|---|
| **Registro** (valência) | o predicado direto |
| **Célula** (sistema × operador) | `VALENCES.some(...)` — marca se **pelo menos um** dos dois registros existentes estiver não caracterizado |
| **Caso** (cabeçalho) | contagem de registros não caracterizados sobre o total de registros **pontuados** |

O `.trim()` não é detalhe: notas contendo só espaços em branco contam como **não
caracterizadas**. Verificado ao vivo com `notes: "   "` (§4).

O contador do cabeçalho conta **registros**, não células. É a unidade em que a caracterização é
escrita e a que aparece na formulação final, então é a contagem que corresponde ao que o
avaliador teria de preencher. Não é o indicador de progresso geral (`x/64`) previsto em outro
item — este mede caracterização **entre o que já foi pontuado**, e por isso não conflita com
aquele nem o antecipa.

---

## 2. Os três indicadores

### 2.1 Grid — marcador de canto

Ponto de **1,5 px de raio, cinza-ardósia** (`bg-slate-400`), com anel branco para destacar do
fundo, ancorado no canto superior direito da célula.

**Por que não contorno tracejado, apesar de sugerido:** `halfClass()` **já usa
`border-dashed`** para significar "valência não registrada". Reaproveitar o tracejado faria dois
estados distintos — "vazio" e "pontuado mas não caracterizado" — falarem a mesma língua visual,
e o grid perderia a leitura à primeira vista que o Sprint 1 construiu. O marcador de canto é
ortogonal ao código de cor existente (matiz = valência, saturação = escore) e não compete com
ele.

**Cinza-ardósia, não âmbar nem vermelho:** isto não é erro nem alerta de validação. O registro é
válido do jeito que está; o que falta é completude, não correção.

### 2.2 Tooltip

O `title` foi posto **em dois lugares**, por um motivo concreto: as duas metades coloridas têm
`title` próprio e cobrem quase toda a área da célula — um `title` só no `<td>` seria mascarado
por elas em praticamente todo hover. Então:

- No `<td>`: o texto pedido, para a área de padding e o canto do marcador.
- Na metade **especificamente** não caracterizada: o título original mais o texto, separado por
  linha em branco — assim a explicação chega já referida à valência sob o cursor.

Texto exibido:

> Esta célula tem processo com severidade registrada, mas sem caracterização do operador
> evolucionário — a formulação final incluirá o escore sem o contexto qualitativo.

### 2.3 Painel de edição — aviso por seção de valência

Linha de texto secundário logo abaixo do campo de caracterização, com o mesmo ponto
cinza-ardósia como marcador:

> ● Sem caracterização processual — esta seção ficará estruturalmente completa, mas
> processualmente vazia na formulação final.

**Lê o rascunho, não o registro salvo.** Aparece assim que o escore é definido e some no primeiro
caractere digitado, sem esperar salvamento — é orientação em tempo real, não veredito sobre o que
está no banco. Sem ícone de erro, sem vermelho, sem borda de alerta: não pode parecer mensagem de
validação de formulário.

### 2.4 Cabeçalho — contador agregado (Passo 4)

> ● 2 de 4 registros sem caracterização processual

Inserido no bloco de título já existente, abaixo do subtítulo — **sem redesenhar o cabeçalho**.
Só aparece quando há o que contar: "0 de 0" num caso recém-criado seria ruído.

---

## 3. Nenhuma validação bloqueante foi introduzida

Confirmado nos três níveis:

| Verificação | Resultado |
|---|---|
| Backend alterado? | **Não.** `git status` após o sprint lista exclusivamente `client/src/pages/EEMMForm.tsx` |
| `PUT` com escore e sem notas ainda é aceito? | **Sim** — `{"system":"cognition","operator":"selection","valence":"maladaptive","severity_score":7,"notes":null}` → **HTTP 200**, registro gravado |
| Há confirmação de "tem certeza que quer salvar sem caracterizar"? | **Não.** Nenhum diálogo, nenhum `disabled` no botão Salvar, nenhum bloqueio de autosave |
| A sinalização impede alguma ação? | **Não.** Os três indicadores são `<span>` e `<p>` sem handler; nada além de renderização |

A filosofia de preenchimento flexível (HU7) está preservada: uma célula com severidade e sem
caracterização continua sendo registro válido e salvável.

---

## 4. Verificação ao vivo — os três estados

Caso "Sprint 7B indicador" (id=14), quatro registros pontuados cobrindo os três estados.

### Estado A — não caracterizado (indicador presente)

Dois registros criados sem caracterização, um com `notes: null` e outro com `notes: "   "`
(caso de borda do `.trim()`):

**Descrição textual do que a tela mostra** — não há captura de tela porque o pane do navegador
deste ambiente não compõe frames (limitação já registrada no `SPRINT_7A_LOG.md` §5.1); o estado
foi lido da página ao vivo via inspeção do DOM.

```
CABEÇALHO
  Sprint 7B indicador
  Formulação EEMM — sistema × operador evolucionário × valência
  ● 2 de 4 registros sem caracterização processual        <- contador

GRID (marcadores de canto detectados)
  Cognição × Seleção   -> ● marcador presente
  Self × Retenção      -> ● marcador presente
  demais 30 células    -> sem marcador

TOOLTIP na metade desadaptativa de Cognição × Seleção
  "Cognição × Seleção — Desadaptativo: 7
   Esta célula tem processo com severidade registrada, mas sem caracterização
   do operador evolucionário — a formulação final incluirá o escore sem o
   contexto qualitativo."

TOOLTIP na metade adaptativa da MESMA célula (sem registro)
  "Cognição × Seleção — Adaptativo: não registrado"      <- sem texto extra

PAINEL de Cognição × Seleção
  seção Adaptativo    -> escore "—", SEM aviso
  seção Desadaptativo -> escore 7,   COM aviso "Sem caracterização processual..."
```

Confirmações que este estado entrega: o marcador aparece só nas células certas; o texto extra do
tooltip aparece só na metade efetivamente não caracterizada; o aviso do painel aparece só na
seção com escore e sem notas; e `notes: "   "` foi corretamente contado como não caracterizado.

### Estado B — indicador some após caracterizar

Texto digitado no campo de caracterização da seção Desadaptativo, **sem salvar ainda**:

```
seção Desadaptativo -> avisoAindaPresente: false
                       textoNoCampo: "Entre interpretacoes possiveis, a de ameaca vem se..."
```

O aviso desaparece **no ato**, sem esperar salvamento. Após clicar em Salvar e fechar o painel:

```
CABEÇALHO
  ● 1 de 4 registros sem caracterização processual        <- era "2 de 4"

GRID
  Self × Retenção -> ● marcador presente                  <- único remanescente
  Cognição × Seleção -> marcador REMOVIDO
```

### Estado C — célula totalmente caracterizada (sem indicador)

`Afeto × Variação` com **as duas valências** pontuadas e caracterizadas (adaptativo 4,
desadaptativo 6):

```
Afeto × Variação -> marcador: ausente
  tooltip adaptativo:    "Afeto × Variação — Adaptativo: 4"        <- sem texto extra
  tooltip desadaptativo: "Afeto × Variação — Desadaptativo: 6"     <- sem texto extra
```

Após caracterizar também o último registro (`Self × Retenção`), o caso inteiro fica limpo:

```
CABEÇALHO
  Sprint 7B indicador
  Formulação EEMM — sistema × operador evolucionário × valência
  (nenhum contador exibido)                               <- some quando chega a zero

GRID
  marcadores: nenhum
```

### 4.1 A formulação de saída não mudou (Passo 5.4)

Formulação gerada com um registro ainda não caracterizado (`Self × Retenção`, escore 3):

```
No sistema Afeto, quanto ao operador de Variação, foi registrado processo adaptativo
com severidade 4/10. Caracterização do avaliador: "...".
No sistema Afeto, quanto ao operador de Variação, foi registrado processo desadaptativo
com severidade 6/10. Caracterização do avaliador: "...".
No sistema Cognição, quanto ao operador de Seleção, foi registrado processo desadaptativo
com severidade 7/10. Caracterização do avaliador: "...".
No sistema Self, quanto ao operador de Retenção, foi registrado processo adaptativo
com severidade 3/10.
```

A última sentença é exatamente o que era antes deste sprint: escore sem caracterização, sem
marca, sem aviso, sem nota de rodapé. **A sinalização vive na interface de edição e não vaza
para o documento de saída** — varredura do JSON da formulação (blocos, disclaimer e summary) por
"caracterização processual", "Sem caracteriza", "não caracterizado", "processualmente vazia",
"indicador" e "lacuna": **nenhuma ocorrência**.

> Registro de honestidade sobre a verificação: a primeira varredura acusou "indicador" e foi
> **falso positivo do próprio teste** — o termo vinha do *nome do caso* ("Sprint 7B indicador"),
> não do texto gerado. A varredura foi refeita excluindo `patientName` e retornou limpa. Fica
> registrado porque um teste que acusa o próprio nome do dado é o tipo de erro que passa por
> verificação se ninguém olhar duas vezes.

### 4.2 Outras confirmações

- Console do navegador: **sem erros**.
- Typecheck: `tsc --noEmit` exit 0 no client **e** no server.
- Caso de teste excluído ao fim, com verificação de integridade:
  `{"deleted":true,"verified":true,"remaining":{"patients":0,"eemm_cells":0,...}}`; banco em
  `patients: 0`, `eemm_cells: 0`.

### 4.3 Limitação de método, herdada

O clique **sintético de mouse** não é despachado neste ambiente (pane sem composição de frames,
mesma causa da falha de `screenshot`, já registrada no `SPRINT_7A_LOG.md` §5.1). Toda a
verificação acima foi feita por **inspeção do DOM ao vivo e acionamento programático dos
próprios handlers da UI** — o que exercita a lógica de detecção, a renderização condicional, o
conteúdo dos tooltips e a reatividade ao rascunho.

**O que isso não exercita:** o `title` nativo do navegador só é *desenhado* em hover real de
mouse. O conteúdo do atributo foi verificado; a **aparição visual do balão** não. Recomendação:
passar o mouse sobre uma célula marcada, em navegador real, antes da coleta — confirma o tooltip
e, de quebra, se o ponto de 1,5 px tem visibilidade suficiente na tela do avaliador, que é um
julgamento visual que nenhuma inspeção de DOM substitui.

---

## 5. Arquivos alterados

| Arquivo | Alteração |
|---|---|
| `client/src/pages/EEMMForm.tsx` | `isUncharacterized()`, `cellHasUncharacterized()`, contagem agregada, marcador de canto no grid, texto no tooltip da metade, aviso por seção no painel, contador no cabeçalho |

Nada mais. Sem migração, sem endpoint, sem alteração de contrato de API.

---

## 6. O que este sprint NÃO resolve

1. **A4 continua ofertado e não exigido** — por decisão de design, não por omissão. O gap da
   Rodada 3 muda de natureza, não desaparece: antes o artefato era silencioso sobre a diferença;
   agora ele a sinaliza e segue aceitando. Para o texto do TCC, a formulação honesta continua
   sendo que **A4 é ofertado pelo instrumento e verificável no dado coletado**, não imposto —
   com a diferença de que agora o avaliador é informado enquanto preenche, o que torna a lacuna
   uma escolha dele e não um acidente.
2. **A classificação PA das 8 células dos sistemas biofisiológico e sociocultural não muda**,
   porque a razão dela é outra: os 8 processos de apoio desses sistemas seguem integralmente
   marcados `VERIFICAR`. Sinalização de interface não resolve dívida bibliográfica.
3. **O indicador de progresso geral (`x/64`)** continua não implementado. O contador deste sprint
   mede caracterização entre registros pontuados, não cobertura da matriz.
