# SPRINT 8 — Infraestrutura de rastreabilidade bibliográfica

**Data:** 12 de agosto de 2026
**Natureza:** infraestrutura, **não conteúdo**. Nenhuma atribuição bibliográfica foi
estabelecida, alterada ou inferida neste sprint.

**Contexto:** os 17 processos marcados `// VERIFICAR:` em `shared/eemm-processes.ts` são o maior
item U1 pendente segundo a Rodada 3 da auditoria (§13). Este sprint cria o **lugar onde a
verificação será registrada**; não a executa.

---

## 1. O que foi criado

### 1.1 Campo `source` no tipo (Passo 1)

Em [shared/eemm-processes.ts](shared/eemm-processes.ts), o tipo `ChangeProcess` ganhou um campo
**opcional**, apoiado numa interface nomeada:

```ts
export interface ProcessSource {
  reference: string;    // "Hayes et al. (2020)"
  location: string;     // "Figura 1, p. 12"
  verifiedBy: string;   // "Marcus"
  verifiedAt: string;   // "2026-08-13"
}

export interface ChangeProcess {
  name: string;
  description: string;
  typicalValence: ProcessValence;
  source?: ProcessSource;   // <- novo, opcional
}
```

**Por que os quatro campos internos são obrigatórios, mas o objeto inteiro é opcional.** São
duas decisões diferentes, e as duas importam:

- *Objeto opcional* — torná-lo obrigatório quebraria a compilação para os 17 itens sem base
  citável, e o efeito prático seria pressão para preencher qualquer coisa e destravar o build.
  Um tipo que induz preenchimento apressado destrói exatamente o que ele deveria garantir. A
  **ausência** do campo é informação: significa "não conferido".
- *Campos internos obrigatórios* — uma procedência sem localização exata, ou sem quem conferiu e
  quando, não é procedência: é a afirmação de que alguém, em algum momento, achou que estava
  certo. O que torna o registro auditável é justamente não admitir preenchimento parcial.

`location` aponta o ponto exato consultado; `reference` identifica a obra. Os dois juntos são o
que permite a um terceiro reabrir a fonte e conferir a mesma coisa.

### 1.2 Tabela de rastreabilidade (Passo 2)

Criado [docs/verificacao-processos-eemm.md](docs/verificacao-processos-eemm.md) — diretório
`docs/` também é novo. Contém:

- A nota de propósito, no topo, conforme especificada.
- **Duas tabelas**, separando os 9 herdados do Sprint 4 dos 8 criados no Sprint 5 — porque a
  natureza da dúvida difere: nos primeiros o processo existe na literatura e a dúvida é a qual
  sistema pertence; nos segundos a dúvida inclui **se figuram como processo de mudança na
  fonte**.
- Colunas `#`, `Processo` e `Sistema` preenchidas por **cópia literal** de
  [SPRINT_5_LOG.md](SPRINT_5_LOG.md) §5. Numeração e nomes não foram reescritos nem
  normalizados.
- As quatro últimas colunas — Referência, Localização, Verificado por, Data — **vazias nas 17
  linhas**.

Dois acréscimos além do pedido, ambos para que a conferência possa ser feita a partir de um
arquivo só:

- **Uma seção "Como preencher"**, incluindo o que fazer quando a fonte **não confirma** a
  atribuição: anotar o achado em vez de deixar a linha em branco, e tratar como mudança de
  conteúdo no mapa, não como verificação concluída. Sem isso, "não confirmado" e "ainda não
  olhei" ficariam indistinguíveis, que é precisamente a ambiguidade que a tabela existe para
  eliminar.
- **Uma tabela da dúvida específica de cada item**, reproduzida do log e dos comentários no
  código. É essa dúvida que precisa ser respondida pela fonte — encontrar o processo mencionado
  em algum lugar da obra não basta.

---

## 2. O que NÃO foi feito, e por quê

### 2.1 Nenhuma citação foi preenchida

**Nenhuma das quatro colunas de verificação foi preenchida em nenhuma das 17 linhas, e nenhum
campo `source` foi preenchido em nenhum item do mapa.**

Não tenho acesso a Hayes et al. (2020, 2022) nem a Hofmann & Hayes (2024). Preencher uma
localização de página, seção ou figura por inferência ou plausibilidade produziria uma citação
acadêmica fabricada — que é pior do que a lacuna, porque a lacuna se resolve consultando a
fonte, enquanto a citação falsa sobrevive à revisão e contamina tudo que se apoiar nela. Isso
vale inclusive para itens em que um palpite pareceria razoável.

### 2.2 Nenhum marcador foi removido (Passo 3)

Os **17** comentários `// VERIFICAR:` seguem no código, intactos. Confirmado por contagem antes
e depois.

O diff em `shared/eemm-processes.ts` é de **adição apenas** — a interface nova e uma linha no
tipo. Nenhum item do mapa `CHANGE_PROCESSES` foi tocado: nem nome, nem descrição, nem
`typicalValence`, nem comentário.

A remoção dos marcadores é **etapa seguinte e condicional**, a ser executada em prompt separado,
com a tabela preenchida em mãos.

---

## 3. Um defeito que este sprint introduziu e corrigiu

Ao documentar o campo `source`, o comentário que escrevi citava a string literal do marcador
para explicar a relação entre os três registros. Efeito colateral imediato:

```
grep -c "// VERIFICAR:" shared/eemm-processes.ts  ->  18
```

**A contagem de itens pendentes passou de 17 para 18 sem que nenhum item novo existisse** — uma
menção em prosa estava sendo contada como se fosse um marcador. Esse número é métrica rastreada
nos logs de sprint e nas três rodadas de auditoria; inflá-lo em um por acidente de redação
corromperia a série histórica.

Corrigido reescrevendo o comentário para não reproduzir a string literal, com nota explicando o
motivo para que ninguém a reintroduza. Contagem de volta a **17**.

### 3.1 Consequência para quem for contar depois

A contagem precisa ser **escopada ao arquivo de código**:

```bash
grep -c "// VERIFICAR:" shared/eemm-processes.ts
```

Uma contagem repo-wide hoje retorna **20**, porque `docs/verificacao-processos-eemm.md` menciona
o marcador 3 vezes — menções legítimas, já que o documento é *sobre* ele. O número correto de
pendências é o escopado: **17**.

---

## 4. Verificação

| Item | Resultado |
|---|---|
| Marcadores `// VERIFICAR:` em `shared/eemm-processes.ts` | **17** (inalterado) |
| Itens com `source` preenchido | **0** — busca por `source:` em item retorna vazio |
| Linhas da tabela com colunas de verificação preenchidas | **0 de 17** |
| Diff em `shared/eemm-processes.ts` | somente adições (interface + 1 campo); nenhum item alterado |
| `tsc --noEmit` | exit 0 no server e no client |

O campo opcional não quebra nada: o projeto compila com os 17 itens sem `source`, que é o estado
real de hoje e o motivo de o campo ser opcional.

---

## 5. Próximo passo — para o usuário

1. **Preencher [docs/verificacao-processos-eemm.md](docs/verificacao-processos-eemm.md)** com as
   citações reais, consultando as fontes. Uma linha por item conferido; itens não conferidos
   ficam em branco.
2. **Rodar o sprint de propagação** (prompt separado, fora do escopo deste), fornecendo a tabela
   preenchida. Ele fará, **item a item e apenas para os verificados**:
   - preencher o `source` do processo correspondente em `shared/eemm-processes.ts`;
   - remover o comentário `// VERIFICAR:` daquele item;
   - atualizar as contagens nos logs e na próxima rodada de auditoria.

A propagação é **por item, não em bloco**: verificar 5 dos 17 remove 5 marcadores e deixa 12. Não
é preciso completar a tabela inteira para rodar a propagação uma primeira vez.

### 5.1 Duas observações que afetam o pré-registro

- **Isto não fecha o item U1 da Rodada 3.** O que este sprint entrega é o lugar onde a
  verificação vira registro auditável. O trabalho bibliográfico em si — que é o item U1 — segue
  integralmente pendente, com 0 de 17 concluídos.
- **A classificação PA das 8 células** dos sistemas biofisiológico e sociocultural depende dos
  itens 10–17 desta tabela. Enquanto eles não estiverem verificados, a justificativa de design
  registrada na Rodada 3 §4.3 continua válida e aquelas células continuam PA, não PF.
