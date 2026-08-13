# SPRINT 11 — Correção de erro de citação: autoria da referência de 2024

**Data:** 2026-08-12
**Natureza:** correção de **erro de pesquisa bibliográfica** introduzido pelos Sprints 9 e 10.

Este log documenta um erro que **este processo cometeu, publicou em dois sprints, sinalizou como
se o correto fosse o errado, e só corrigiu na quarta oportunidade**. Está aqui por decisão
explícita: erros identificados e corrigidos publicamente são parte do ciclo de rigor da DSR, não
algo a esconder.

---

## 1. O erro

| | Forma |
|---|---|
| **Usada nos Sprints 9 e 10** | `Ciarrochi, Hernández, Hill, Ong, Gloster, Levin, Yap, Fraser, Sahdra, Hofmann & Hayes (2024)` — **onze autores** |
| **Abreviação usada** | `Ciarrochi et al. (2024)` |
| **Correta** | **`Hofmann, S. G., & Hayes, S. C. (2024)`** — **dois autores** |

A forma de onze autores não é uma variação de estilo nem uma ordem alternativa: **atribui a obra
a nove pessoas que não a assinam** e desloca os dois autores reais para o fim da lista.

### 1.1 Origem

A autoria veio de uma **fonte indexada incorretamente** e **não foi conferida contra a entrada
oficial da revista**. O erro entrou no Sprint 9, na propagação das citações, e foi replicado no
Sprint 10 sem nova conferência — porque o Sprint 10 tratou a forma do Sprint 9 como já
estabelecida.

O que falhou não foi a leitura das fontes: as `location` estão corretas, o conteúdo citado
(estudo de caso Mora, Figura 3, Tabela 2, seções) confere. Falhou a **verificação da entrada
bibliográfica em si** — o passo de abrir a página oficial do artigo e conferir a linha de autoria.

### 1.2 Correção

Confirmada contra a **lista de Referências real do TCC, pelos próprios autores do trabalho**.

---

## 2. O que foi alterado

### Passo 1 — Localização (antes de qualquer alteração)

`grep "Ciarrochi"` cruzado com `2024`:

| Arquivo | Ocorrências |
|---|---|
| `shared/eemm-processes.ts` | 11 linhas (2 na forma longa, 8 como `Ciarrochi et al. (2024)`, 1 como `Ciarrochi et al., 2024` em comentário) |
| `docs/verificacao-processos-eemm.md` | 11 linhas (2 na forma longa, 9 como `Ciarrochi et al. (2024)`) |

### Passo 2 — Substituição

| De | Para | Ocorrências |
|---|---|---|
| forma de onze autores | `Hofmann & Hayes (2024)` | 2 + 2 |
| `Ciarrochi et al. (2024)` | `Hofmann & Hayes (2024)` | 8 + 9 |
| `Ciarrochi et al., 2024` | `Hofmann & Hayes, 2024` | 1 + 0 |
| **Total** | | **22** |

**Nada além da autoria foi tocado.** Preservados integralmente: todos os campos `location`, todas
as descrições de processo no que diz respeito a conteúdo, todas as decisões de atribuição
sistema→processo, e a referência de 2022 (`Hayes, Ciarrochi, Hofmann, Chin & Sahdra (2022)`), que
é obra distinta e permanece com 11 ocorrências no código e 13 na tabela.

#### Uma decisão de escopo que precisei tomar

O Passo 2 do pedido dizia "apenas o campo `reference`", mas quatro ocorrências estavam **em prosa**
— na descrição do processo Hipervigilância, no comentário da busca negativa de Biofisiológico, e
em duas passagens da tabela. Mantê-las produziria um arquivo que **corrige a autoria no campo
formal e a mantém errada no texto corrido**, e o Passo 4 (grep zero) seria impossível de
satisfazer.

Tratei autoria como autoria onde quer que estivesse. A restrição do Passo 2 protege o **conteúdo
bibliográfico** (Mora, seções, figuras) — e esse não foi tocado. Trocar quem assina a obra numa
frase de descrição é a mesma correção, não uma alteração de conteúdo.

### Passo 3 — Nota em `docs/verificacao-processos-eemm.md`

Acrescentada a seção **"Forma canônica da referência de 2024 — corrigida no Sprint 11"**,
declarando: a forma correta de dois autores; que a de onze foi erro de pesquisa dos Sprints 9–10,
de fonte indexada incorretamente e não conferida contra a entrada oficial; que a correção foi
confirmada contra a lista de Referências do TCC pelos autores; e que nenhuma `location`,
descrição ou decisão de atribuição foi alterada.

A nota sobre **2022** permanece intacta e agora declara explicitamente que não é afetada por esta
correção — são obras distintas, e confundir as duas notas seria fácil.

### Passo 4 — Verificação

| Verificação | Resultado |
|---|---|
| `Ciarrochi et al. (2024)` no escopo | **0** |
| `Ciarrochi et al., 2024` no escopo | **0** |
| Forma de onze autores no escopo | **0** |
| `Hofmann & Hayes (2024)` presente | **11 + 11** |
| `Hayes, Ciarrochi, Hofmann, Chin & Sahdra (2022)` preservada | **11 + 13** |
| `location` e conteúdo (caso Mora) preservados | **5 + 5**, inalterados |
| `tsc --noEmit` | **exit 0** no server e no client |

**Nota sobre o grep de verificação.** Um `grep "Ciarrochi" \| grep "2024"` por linha ainda retorna
**4 + 4 ocorrências**, e elas são **falso positivo**: são as linhas de referência dupla, onde
"Ciarrochi" pertence à citação de 2022 e o 2024 já está correto —

```
"Hayes, Ciarrochi, Hofmann, Chin & Sahdra (2022); Hofmann & Hayes (2024)"
```

A verificação válida é por **string de atribuição**, não por co-ocorrência na linha, e essa
retorna zero. Duas ocorrências adicionais em `docs/` são a própria nota do Passo 3, que cita a
forma errada para declará-la errada — mesmo padrão da nota de 2022.

---

## 3. O achado mais desconfortável: o Sprint 9 sinalizou o certo como errado

O `SPRINT_9_LOG.md` §5 listou quatro ocorrências de `Hofmann & Hayes (2024)` no repositório e as
classificou assim:

> "omite nove coautores e inverte a ordem de autoria, colocando como primeiros autores os dois
> últimos da lista real"

**Estava exatamente invertido.** `Hofmann & Hayes (2024)` era a forma **correta**; a "lista real"
contra a qual foi comparada era a errada. As quatro ocorrências sinalizadas — incluindo o
cabeçalho `shared/eemm-processes.ts:6`, que existe desde o Sprint 5 — **estavam certas desde
sempre**.

O Sprint 9 recomendou explicitamente:

> "Recomendação: corrigir ao menos a de `shared/eemm-processes.ts:6`, que é código de produção e
> a mais visível."

**Executar essa recomendação teria propagado o erro para o cabeçalho do arquivo.** Ela não foi
executada porque a instrução era não alterar arquivos fora do escopo sem autorização, e a
autorização foi retida. Verificado agora: a linha 6 continua correta.

```
* Base teórica: Hayes et al. (2020, 2022); Hofmann & Hayes (2024). O conteúdo aqui é
```

### 3.1 O que isso ensina, e é citável na documentação de rigor

Três coisas, em ordem de importância:

1. **Uma verificação pode ser confiante e errada.** O Sprint 9 não só usou a autoria errada — ele
   **auditou o repositório contra ela** e produziu uma tabela de "ocorrências incorretas" que
   listava as corretas. Confiança na verificação não é evidência de que ela está certa.
2. **A retenção de autorização funcionou como controle de dano.** A prática de não corrigir fora
   de escopo sem aprovação, adotada por conservadorismo processual e não por desconfiança daquele
   achado específico, impediu que o erro alcançasse o cabeçalho do arquivo. Controles processuais
   pagam justamente nos casos em que ninguém suspeitava de nada.
3. **A conferência de autoria é um passo distinto da conferência de conteúdo.** Todas as
   `location` deste sprint estavam certas — quem leu as fontes leu as fontes certas. O que não foi
   feito foi abrir a entrada oficial e conferir quem assina. São dois passos, e o segundo foi
   pulado nas duas vezes.

---

## 4. Ocorrências fora do escopo — NÃO corrigidas

O pedido escopou os Passos 1–4 a dois arquivos. A forma errada persiste em três outros, todos
documentos de registro:

| Arquivo | Ocorrências | Status |
|---|---|---|
| `SPRINT_9_LOG.md` | 3 | commitado (`371e07d`) |
| `SPRINT_10_LOG.md` | 3 | commitado (`46f9dc5`) |
| `AUDITORIA_METODOLOGIA_R5.md` | 1 | não rastreado |

**Recomendação, e ela não é uniforme:**

- **`AUDITORIA_METODOLOGIA_R5.md`** ainda não foi commitado e é a auditoria **vigente** — a que
  será citada. Vale corrigir antes de commitar, para não publicar uma auditoria que cita a obra
  com autoria errada.
- **`SPRINT_9_LOG.md` e `SPRINT_10_LOG.md`** já estão no histórico e são **registro do que
  aconteceu naquele momento**, incluindo o erro. Reescrevê-los apagaria a evidência de que o erro
  existiu — que é justamente o que este log documenta. A alternativa melhor é **deixá-los como
  estão** e apontar para este sprint, o que a nota do Passo 3 já faz.

Nenhuma das três foi alterada. A decisão é dos autores.

---

## 5. Arquivos alterados

| Arquivo | Alteração |
|---|---|
| `shared/eemm-processes.ts` | 11 substituições de autoria; nenhuma `location`, descrição de conteúdo ou atribuição tocada |
| `docs/verificacao-processos-eemm.md` | 11 substituições; nota nova sobre a forma canônica de 2024 e o erro dos Sprints 9–10 |

Schema, rotas, `shared/eemm-types.ts` e a lógica da aplicação **não foram tocados**. Nenhum
processo mudou de nome, de sistema ou de valência. A matriz de conformidade **não é afetada**: os
16 processos com `source` continuam com os quatro subcampos preenchidos, e a mudança é no
conteúdo do campo `reference`, não na sua existência.

---

## 6. Efeito nas auditorias

**Nenhuma conclusão da Rodada 5 muda.** A promoção das 8 células de PA para PF se apoiava na
**existência de citação conferida**, não na autoria específica da obra de 2024. Os processos
seguem citados; a obra é a mesma; o que se corrigiu foi quem a assina.

O que muda é um detalhe de apresentação: a R5 cita a forma errada uma vez (§4 desta nota), e vale
corrigi-la antes do commit, pelo motivo da §4.
