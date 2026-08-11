# Sprint 2 — Convergência de repositório

**Data:** 2026-08-11
**Escopo:** estritamente convergência — eliminar a divergência entre as duas implementações
paralelas do artefato, fixar a cópia canônica e garantir que o deploy registrado no `.replit`
aponte para a mesma implementação corrigida no Sprint 1.
**Deliberadamente NÃO implementado:** formulação textual, ajuda contextual, purga automática e
demais itens do backlog U2.

Fecha os itens U1 nº 4 (bancos fora do versionamento) e nº 5 (convergência das cópias) da lista
pré-registro do relatório de auditoria ([AUDITORIA_METODOLOGIA.md](AUDITORIA_METODOLOGIA.md),
Seção 11).

---

## 0. Pré-requisito e ordem de commits

O Sprint 1 foi confirmado antes de qualquer alteração: `shared/eemm-types.ts` presente com os três
níveis corretos (`biophysiological`/`psychological`/`sociocultural`) e `server/src/database.ts` com
a coluna `valence` e `UNIQUE(patient_id, dimension, level, valence)`.

**Desvio de processo encontrado e corrigido:** o Sprint 1 estava aplicado no diretório de trabalho
mas **não havia sido commitado** — `HEAD` ainda era `336fe44`. Como o Sprint 2 executa operações
destrutivas (remoção de diretórios, `git rm --cached`), e como a rastreabilidade por commit é
requisito explícito, o trabalho anterior foi commitado antes de começar:

| Commit | Conteúdo |
|---|---|
| `3212b95` | Relatório de auditoria de conformidade metodológica |
| `8fec1cc` | Sprint 1 — schema bivalente e eixo de 3 níveis |

Só então o Sprint 2 teve início. A ordem cronológica dos três blocos de trabalho
(auditoria → correção estrutural → convergência) fica preservada no histórico.

---

## 1. Inventário completo das duas cópias (Passo 1)

### 1.1 Contexto factual levantado

| Aspecto | `server/` + `client/` | `artifacts/api-server/` + `artifacts/eemm-client/` |
|---|---|---|
| Último commit que tocou o diretório | `1db1307` (2026-03-25) — antes do Sprint 1 | `336fe44` (2026-05-29) |
| Executado pelos `[workflows]` do `.replit` | **Sim** — `cd server && npm run dev` (:3001) e `cd client && npm run dev` (:5173) | Não |
| Registrado em `[[artifacts]]` para deploy | Não | **Sim**, apenas `artifacts/api-server`. `artifacts/eemm-client` **nunca esteve registrado** |
| Gerenciador de pacotes | npm, com `package-lock.json` próprio; fora do pnpm workspace | pnpm workspace (`@workspace/api-server`, `@workspace/eemm-client`) |
| Recebeu o Sprint 1 | Sim | Não |
| Banco de dados | `server/database.sqlite` | `artifacts/api-server/database.sqlite` (segundo banco, independente) |

### 1.2 Tabela de funcionalidades

| Funcionalidade | Existe em server/client? | Existe em artifacts/? | Divergente ou idêntica? | Vale preservar de artifacts/? |
|---|---|---|---|---|
| `GET /patients` (listar) | Sim | Sim | Idêntica (só muda o prefixo de montagem da rota) | Não |
| `POST /patients` (criar) | Sim | Sim | Idêntica; artifacts/ tem um cast de tipo em `req.body` sem validação runtime adicional | Não |
| `GET /patients/:id` | Sim | Sim | Idêntica | Não |
| `DELETE /patients/:id` | Sim | Sim | Idêntica | Não |
| `GET /patients/:id/eemm` | Sim | Sim | **Divergente**: artifacts/ devolve grade sobre eixo errado | Não |
| `PUT /patients/:id/eemm` | Sim | Sim | **Divergente**: idem | Não |
| Health check | `/health` → `{ok:true}` | `/healthz`, validado por `HealthCheckResponse` de `@workspace/api-zod` | Divergente | **Não** — arrastaria a cadeia `lib/api-zod` → `lib/api-spec`, órfã (ver 1.4) |
| Logger estruturado (pino) | Não | Sim (`src/lib/logger.ts`) | Só em artifacts/ | Não — fora de escopo; e `pino` é dependência de produção que a aplicação real não usa |
| Schema `eemm_cells` | **Pós-Sprint 1**: `valence` + `UNIQUE(...,valence)` + CHECKs | Legado: `UNIQUE(patient_id, dimension, level)`, sem valência | **Divergente** | Não |
| `LEVELS` (eixo de níveis) | `biophysiological`/`psychological`/`sociocultural` | `variation`/`selection`/`retention` | **Divergente — é o bug** | Não |
| `PatientList.tsx` | Sim | Sim | **Byte a byte idêntica** (verificado por `diff` contra o estado pré-Sprint 1) | Não |
| `EEMMForm.tsx` | Sim | Sim | Pré-Sprint 1, a **única** diferença era o array `LEVELS` | Não |
| `App.tsx` (roteamento) | Sim | Sim | **Byte a byte idêntica** — nenhuma das duas tem rota `*` | Não |
| `not-found.tsx` (página 404) | **Não** | **Sim** | Só em artifacts/ | **Não — é código morto** (ver 1.3) |
| 55 componentes shadcn/ui | Não | Sim | Só em artifacts/ | **Não — 54 de 55 nunca importados** (ver 1.3) |
| Hooks `use-mobile`, `use-toast` | Não | Sim | Só em artifacts/ | Não — nenhum é importado por página, `App.tsx` ou `main.tsx` |

### 1.3 Análise do que só existia em artifacts/ (a exceção do Passo 2)

O Passo 2 autoriza extrair de `artifacts/eemm-client` qualquer coisa genuinamente útil e ausente em
`client/`. Foram examinados os três candidatos:

**Componentes shadcn/ui (55 arquivos).** Busca por importações em `src/pages/`, `src/App.tsx` e
`src/main.tsx` retornou **uma única** ocorrência: `not-found.tsx` importa `card.tsx`. Os outros 54
componentes são scaffolding gerado pelo agente, nunca referenciado. As páginas reais
(`PatientList`, `EEMMForm`) são escritas em Tailwind puro nas duas cópias e não consomem nenhum
componente da biblioteca. **Nada a preservar.**

**`not-found.tsx`.** É o único arquivo com funcionalidade aparente ausente em `client/`, e à
primeira vista pareceria valer a extração — a auditoria registrou que navegar para uma rota
inexistente renderiza página em branco. **Porém, o arquivo é código morto também em `artifacts/`:**
`artifacts/eemm-client/src/App.tsx` é byte a byte idêntico ao de `client/` e **também não declara
rota `*`**. A página 404 nunca foi alcançável em nenhuma das duas cópias.

Consequência para a decisão: não se trata de funcionalidade presente em uma cópia e ausente na
outra — é arquivo órfão. Extraí-lo exigiria **criar** a rota de fallback, o que seria adicionar
comportamento novo, não preservar comportamento existente, e contrariaria a exigência do Passo 5 de
que este sprint não altere comportamento de produto. **Nada foi extraído.** A adição de uma rota
`*` fica registrada como candidata a backlog (Seção 7).

**Hooks (`use-mobile`, `use-toast`).** Nenhum importado em lugar nenhum. **Nada a preservar.**

### 1.4 Órfãos revelados pela remoção

`artifacts/api-server` era o **único** consumidor real de `lib/`, via as dependências
`@workspace/db` e `@workspace/api-zod` declaradas em seu `package.json` (e o import de
`HealthCheckResponse` em `src/routes/health.ts`). Busca em todo o repositório remanescente por
`@workspace/db`, `@workspace/api-zod` e `@workspace/api-client-react` retorna apenas:

- templates de skills do Replit sob `.local/` (diretório ignorado pelo Git, não é código do projeto);
- a string literal `"Hello from @workspace/scripts"` em `scripts/src/hello.ts` (um `console.log`).

Ou seja: **`lib/db`, `lib/api-zod`, `lib/api-client-react` e `lib/api-spec` ficaram órfãos.**
Nenhum deles é consumido por `server/` ou `client/`, que usam SQLite via `better-sqlite3`. Conforme
instruído, o diretório `lib/` **não foi removido** — apenas sinalizado (Seção 7).

---

## 2. Decisão de canonicidade (Passo 2)

**`server/` + `client/` é a cópia canônica.** Regra aplicada conforme determinado, com os motivos
registrados para o texto do TCC:

1. **É o que efetivamente roda.** Os `[workflows]` do `.replit` executam `server/` e `client/`; era
   sobre esse par que toda a verificação ao vivo da auditoria e do Sprint 1 foi feita.
2. **É o que recebeu a correção estrutural** do Sprint 1 (bivalência e eixo de 3 níveis).
3. **`artifacts/` não era uma segunda fonte de verdade legítima.** Foi gerada automaticamente por
   um agente e nunca mantida em paridade; sua existência divergente é o problema a eliminar, não
   uma alternativa a avaliar. O commit `336fe44` é a prova disso: alterou o eixo de níveis
   **apenas** na cópia de deploy, produzindo duas matrizes EEMM mutuamente incompatíveis no mesmo
   repositório — e a versão registrada para publicação era a incorreta.

Nada foi extraído de `artifacts/` antes da eliminação, pela análise da Seção 1.3.

---

## 3. Eliminação controlada (Passo 3)

### 3.1 Snapshot de segurança

| Item | Valor |
|---|---|
| Tag | `pre-sprint2-artifacts-snapshot` (anotada) |
| Commit apontado | `8fec1cc` |
| Conteúdo verificado | `artifacts/api-server`, `artifacts/eemm-client`, `artifacts/mockup-sandbox` presentes; `LEVELS = ["variation","selection","retention"]` preservado |
| Recuperação | `git checkout pre-sprint2-artifacts-snapshot -- artifacts/` |

A cópia divergente não se perde: fica recuperável fora do fluxo normal de trabalho, o que é
diferente de mantê-la no repositório principal.

### 3.2 Remoção

`artifacts/api-server/` e `artifacts/eemm-client/` removidos do índice e do disco — **89 arquivos
rastreados**. Permanece apenas `artifacts/mockup-sandbox/` (ver Seção 7).

### 3.3 Bancos fora do versionamento

| Antes | Depois |
|---|---|
| `git ls-files \| grep sqlite` → 6 arquivos (`server/database.sqlite{,-shm,-wal}` e as cópias em `artifacts/api-server/`) | **vazio** |

- Os três de `artifacts/api-server/` saíram junto com o diretório.
- Os três de `server/` foram retirados com `git rm --cached` — **preservados em disco**, apenas
  destrastreados.
- `.gitignore` da raiz passou a ignorar `*.sqlite`, `*.sqlite-shm`, `*.sqlite-wal`, `*.sqlite3` e
  `*.db`, com comentário explicando a motivação (§4.10).

**O histórico do Git NÃO foi reescrito**, por decisão deliberada e conforme instruído: `rebase`/
`filter-branch` exigiriam aprovação explícita, dado o risco de quebrar o histórico de commits que
documenta o processo do TCC. Consequência a declarar no texto: os bancos permanecem presentes em
commits anteriores a `336fe44`; a proteção vale **daqui para frente**. Isso é limitação documentada,
não problema resolvido.

### 3.4 Configuração residual

`scripts/post-merge.sh` — removida a linha `pnpm --filter db push`. Motivo: empurrava o schema
Drizzle/Postgres de `lib/db`, que a aplicação real não consome (Seção 1.4). Observação técnica
registrada no próprio arquivo: o filtro `db` sequer casava com o nome real do pacote
(`@workspace/db`), de modo que a linha provavelmente **derrubava o hook** por causa do `set -e` —
ou seja, o post-merge do projeto estava quebrado desde o início.

`lib/` **não removido**, apenas sinalizado (Seção 7).

---

## 4. `.replit` — antes e depois (Passo 4)

### Antes

```toml
[[artifacts]]
id = "artifacts/api-server"

[[artifacts]]
id = "artifacts/mockup-sandbox"

[deployment]
router = "application"
deploymentTarget = "autoscale"

[deployment.postBuild]
args = ["pnpm", "store", "prune"]
env = { "CI" = "true" }
```

### Depois

```toml
[deployment]
deploymentTarget = "autoscale"
build = ["sh", "-c", "cd server && npm ci && npm run build && cd ../client && npm ci && npm run build"]
run = ["sh", "-c", "cd server && NODE_ENV=production npm run start"]
```

(precedido de bloco de comentários explicando a mudança e a tag de snapshot)

### Mudanças de suporte necessárias

O par canônico não tinha caminho de produção — só scripts de `dev` acionados pelos workflows. Foi
preciso criar um:

| Arquivo | Mudança |
|---|---|
| `server/package.json` | novos scripts `build` (`tsc --noEmit`, portão de validação) e `start` |
| `server/src/index.ts` | `PORT` passa a respeitar `process.env.PORT` (exigido pelo autoscale), com fallback 3001; em `NODE_ENV=production` o Express serve `client/dist` como estático, com fallback de SPA registrado **depois** das rotas `/api` |

O bloco de estático é guardado por `NODE_ENV === "production"`, então **o comportamento de
desenvolvimento não muda em nada**: o Vite continua servindo o frontend em :5173 com proxy para
`/api`, exatamente como antes. Os `[workflows]` não foram alterados.

Entradas `[[artifacts]]` removidas por completo: a de `api-server` porque o diretório deixou de
existir (mantê-la quebraria a configuração), e a de `mockup-sandbox` para que o `.replit` não
misture o modelo de artefatos do Replit com um `[deployment]` clássico de `build`/`run`. O
diretório `mockup-sandbox` **permanece em disco** (ver Seção 7).

### Limitação a declarar

**A configuração de deploy não pôde ser exercitada nesta auditoria** — não há ambiente Replit
disponível localmente. `build` e `run` foram escritos conforme o modelo clássico de deployment do
Replit e são coerentes com os `package.json` reais, mas **precisam ser validados numa publicação de
teste antes de qualquer demonstração à banca ou coleta de dados com avaliadores.** O que foi
verificado localmente é o comportamento de desenvolvimento (Seção 5), idêntico ao anterior.

---

## 5. Verificação de consistência (Passo 5)

| Verificação | Resultado |
|---|---|
| Bug original (`variation`/`selection`/`retention` como níveis) em código rastreado | **Zero ocorrências.** Aparece apenas em `AUDITORIA_METODOLOGIA.md`, onde o bug é descrito propositalmente |
| Declarações de `LEVELS` no repositório | **Exatamente uma**: `shared/eemm-types.ts:24` |
| `package.json` de backend ativo | **Um**: `server/package.json` |
| `package.json` de frontend ativo | **Um**: `client/package.json` |
| `git ls-files \| grep sqlite` | **Vazio** |
| `tsc --noEmit` strict, `server/` | **exit 0** |
| `tsc --noEmit` strict, `client/` | **exit 0** |

### 5.1 Roteiro do Apêndice C, executado ao vivo

Servidor Express real em :3001 e Vite real em :5173, com confirmação por consulta direta ao SQLite.
Nenhuma diferença de comportamento em relação ao fim do Sprint 1 — que é exatamente o resultado
esperado, já que este sprint não deveria alterar produto.

| Tarefa | Resultado | Evidência |
|---|---|---|
| **T1** — criar caso | **Executa sem quebra** | "Caso Sprint 2" criado pelo modal e listado |
| **T2** — afeto adaptativo, nível psicológico | **Executa sem quebra** | Grid renderiza cabeçalhos `Biofisiológico / Psicológico / Sociocultural`; painel grava linha id 1 (`adaptive`, 6) |
| **T3** — afeto desadaptativo, **mesma célula** | **Executa sem quebra** | Linha id 2 (`maladaptive`, 9) coexiste com a id 1; confirmado no banco |
| **T4** — 5 dimensões restantes × 3 níveis | **Executa sem quebra** | 30 `PUT`s, 30 sucessos, 0 falhas; 32 linhas totais, 16 células com ambas as valências |
| **T6** — editar registro anterior | **Executa sem quebra** | Reabrir a célula carregou os valores salvos (6 / "T2: tolera e nomeia o afeto" e 9 / "T3: evitacao experiencial"); edição do adaptativo (6 → 2) atualizou **in place** (`id` permaneceu 1) sem tocar o desadaptativo |

Verificações complementares: migração re-executou de forma idempotente no start
(`1 linha preservada em eemm_cells_legacy_backup`); exclusão do caso de teste removeu as 32 células
em cascata, com **0 linhas órfãs**; console do navegador sem erros de aplicação.

---

## 6. Nota para o texto do TCC (§4.6 / §5.1 e Atividade 3)

> A partir deste commit, o repositório contém **uma única implementação do artefato**. O arquivo
> `shared/eemm-types.ts` é a fonte de verdade única para `Dimension`, `Level` e `Valence`, consumido
> por backend e frontend a partir do mesmo módulo, sem duplicação — verificável pelo fato de a
> constante `LEVELS` ser declarada em exatamente um ponto de todo o código-fonte.

Esta é a frase que sustenta **materialmente** a afirmação do §4.6/§5.1 de que a tipagem estática
preserva a integridade estrutural do metamodelo, e pode ser citada como tal na documentação
retroativa da Atividade 3.

O registro histórico honesto que a acompanha, e que convém declarar em vez de omitir: até o commit
`336fe44` a afirmação **não** se sustentava. Havia duas implementações com declarações independentes
de dimensões e níveis, e foi justamente essa duplicação que permitiu a uma delas divergir — trocando
o eixo de níveis pelos operadores evolucionários — sem que compilador, teste ou checagem cruzada
acusasse o problema. A correção da causa (fonte única tipada) e a eliminação do efeito (cópia
divergente) estão documentadas, respectivamente, no Sprint 1 e neste sprint. Um artefato de DSR cuja
trajetória de correção está documentada é mais defensável do que um que aparenta nunca ter tido o
problema.

---

## 7. Sinalizações — decisões que ficaram em aberto

Nenhum destes itens foi executado neste sprint; todos precisam de decisão explícita.

| Item | Situação | Recomendação |
|---|---|---|
| `lib/db`, `lib/api-zod`, `lib/api-client-react`, `lib/api-spec` | **Órfãos** — o único consumidor era `artifacts/api-server` | Candidatos a remoção. Implicam também limpar `references` em `tsconfig.json` da raiz e `packages` em `pnpm-workspace.yaml`. Confirmar antes: `lib/db` traz Drizzle/Postgres, incompatível com a arquitetura SQLite real do artefato |
| `artifacts/mockup-sandbox/` | Mantido em disco; registro `[[artifacts]]` removido | É ferramenta de preview de componentes do Replit, não faz parte do artefato sob estudo. Remoção não foi autorizada neste sprint |
| Histórico do Git com bancos versionados | Não reescrito, por decisão deliberada | Declarar como limitação no §4.10 do texto. Reescrita exige aprovação explícita |
| Rota de fallback `*` (404) | Ausente em ambas as cópias; `not-found.tsx` era código morto | Backlog. Hoje uma rota inexistente renderiza página em branco (achado T7 da auditoria) |
| Deploy no Replit | Reconfigurado, **não validado em execução** | Publicar uma vez em ambiente de teste antes de qualquer demonstração ou coleta |
| `server` usa `ts-node` também em produção | `start` idêntico a `dev` | Aceitável para artefato de pesquisa de instância única; empacotar com esbuild é otimização futura, não bloqueio |

---

## 8. Arquivos alterados e criados

### Criados
- `SPRINT_2_LOG.md` (este documento)

### Alterados
| Arquivo | Mudança |
|---|---|
| `.replit` | `[[artifacts]]` removidas; `[deployment]` reconfigurado para `server/` + `client/` |
| `.gitignore` | Passa a ignorar `*.sqlite*`, `*.sqlite3`, `*.db` |
| `scripts/post-merge.sh` | Removida a referência a `pnpm --filter db push` |
| `server/package.json` | Scripts `build` e `start` para produção |
| `server/src/index.ts` | `PORT` por variável de ambiente; serviço de estático do `client/dist` em produção |

### Removidos
- `artifacts/api-server/` — 18 arquivos rastreados
- `artifacts/eemm-client/` — 71 arquivos rastreados
- `server/database.sqlite`, `-shm`, `-wal` — retirados do tracking (preservados em disco)

Total: **92 arquivos removidos do controle de versão, 7.981 linhas deletadas.**
