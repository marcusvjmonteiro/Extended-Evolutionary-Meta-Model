# SPRINT 6 — Containerização (preparação, sem deploy)

**Data:** 12 de agosto de 2026
**Escopo:** tornar a aplicação containerizável e commitar todo o estado pendente.
**Fora de escopo por decisão deliberada:** nenhum deploy para Cloud Run, GCP ou qualquer
plataforma. Adiado até a liberação de créditos de cloud, para não gerar custo antes do
necessário. **Nenhum comando de nuvem foi executado neste sprint.**

**Pré-requisito verificado:** Sprint 5 confirmado em disco — `SYSTEMS` (8, composto de
`DIMENSIONS` + `ADDITIONAL_LEVELS`), `OPERATORS` (4) em `shared/eemm-types.ts`; schema
`eemm_cells` com colunas `system`/`operator`/`valence` em `server/src/database.ts`.

---

## 1. Escolha da imagem base — glibc, não musl

`better-sqlite3@12.8.0` é módulo **nativo**. Verificado no `package.json` do próprio pacote
instalado:

```
install script: prebuild-install || node-gyp rebuild --release
binário presente: server/node_modules/better-sqlite3/build/Release/better_sqlite3.node
```

Ou seja: tenta baixar binário pré-compilado e, se não achar, **compila na hora**. Os prebuilds
publicados são para **glibc**. Em alpine/musl o `prebuild-install` não encontra binário
compatível, cai para o `node-gyp`, e numa imagem alpine sem toolchain isso falha — às vezes só
no carregamento do `.node` em runtime, que é o modo de falha caro.

**Decisão: `node:20-slim` (Debian, glibc)** em todos os estágios. Custa ~40 MB a mais que
alpine e elimina a classe inteira de problema. Os estágios de build instalam
`python3 make g++` mesmo assim, para que o caminho do `node-gyp` funcione caso o prebuild não
esteja disponível; **o estágio final não leva o toolchain**.

---

## 2. Dockerfile — 4 estágios

O pedido previa 3. Foi usado um quarto (`server-deps`) por um motivo concreto:
`npm ci --omit=dev` **reexecuta** o script de instalação do `better-sqlite3`, que pode
compilar. Fazer isso num estágio próprio mantém `python3/make/g++` fora da imagem final sem
abrir mão de um `node_modules` construído para linux.

| Estágio | Base | Produz |
|---|---|---|
| `client-build` | node:20-slim | `/app/client/dist` (Vite) |
| `server-build` | node:20-slim + toolchain | `/app/server/dist` (tsc) |
| `server-deps` | node:20-slim + toolchain | `node_modules` de produção, nativo linux |
| `runtime` | node:20-slim | imagem final, sem toolchain, usuário não-root |

### 2.1 Mudanças de código que o Dockerfile exigiu

**`server/package.json` — o script de build não emitia nada.** Era `"build": "tsc --noEmit"`,
que apenas checa tipos. O Dockerfile invoca `npm run build` esperando `dist/`; com o script
antigo o estágio 2 teria "sucesso" e produzido diretório vazio. Corrigido:

```
"build":     "tsc -p tsconfig.build.json"   (emite)
"typecheck": "tsc --noEmit"                 (checa, inalterado)
"start":     "node dist/server/src/index.js"
```

**`server/tsconfig.build.json` (novo).** Configuração de emissão separada da de checagem, com
`rootDir: ".."` declarado explicitamente. Não é estilo: o programa inclui `src/**/*` **e**
`../shared/**/*`, então o diretório raiz comum é a raiz do repositório, e o layout emitido é

```
dist/server/src/index.js     <- ponto de entrada
dist/shared/*.js             <- alvo do alias @shared/*
```

Declarado, esse layout é estável; inferido, mudaria em silêncio se o conjunto de arquivos
mudasse.

**Resolução do alias `@shared/*` em produção.** O JS emitido conserva
`require("@shared/eemm-types")`. Em vez de carregar `tsconfig-paths` no processo de produção
(dependência extra + hook de resolução), o Dockerfile expõe o diretório compilado como pacote:

```dockerfile
RUN cp -r ./dist/shared ./node_modules/@shared
```

A resolução nativa do Node dá conta. **Verificado localmente contra o build real antes de
entrar no Dockerfile** (ver §4).

**`server/src/database.ts` — caminho do SQLite configurável.**

```ts
const DATABASE_PATH =
  process.env.DATABASE_PATH || path.join(__dirname, "..", "database.sqlite");
```

O fallback é o caminho histórico, então `npm run dev` se comporta exatamente como antes —
nenhuma variável precisa ser definida para desenvolver. No container, `DATABASE_PATH` aponta
para `/app/data/database.sqlite`, diretório dedicado e gravável. Sem isso o banco cairia dentro
de `dist/`, onde o processo não deve escrever e cujo conteúdo é descartável a cada rebuild.

O diretório é criado com dono explícito, porque a imagem roda como não-root:

```dockerfile
RUN mkdir -p /app/data && chown -R node:node /app/data
USER node
```

**`server/src/index.ts` — `PORT` de variável de ambiente.** Já estava como
`Number(process.env.PORT) || 3001`; foi mantido e documentado no código. Plataformas de
container injetam `PORT` e esperam que o processo escute nela — porta fixa faz o contêiner
subir e nunca receber tráfego. Está pronto antes de existir deploy de propósito, que é o pedido.

**`server/src/index.ts` — `CLIENT_DIST_PATH`.** O bloco de produção usava
`path.join(__dirname, "..", "..", "client", "dist")`. Rodando de `dist/server/src/`, isso
apontaria para dentro de `dist/`. Agora é `process.env.CLIENT_DIST_PATH` com o mesmo fallback
relativo de antes.

---

## 3. `.dockerignore`

Cobre o pedido e um pouco mais. Duas exclusões merecem registro por não serem de tamanho:

**`node_modules/`** — crítico, não otimização. `server/node_modules` contém
`better_sqlite3.node` compilado para o **host Windows**. Copiá-lo para uma imagem linux
produziria um módulo que "instala com sucesso" e explode ao ser carregado.

**`*.sqlite` / `*.sqlite-shm` / `*.sqlite-wal`** — exclusão de **governança de dados**. O banco
de desenvolvimento contém registros de casos de teste. Assá-lo numa imagem de container é
publicação de dado: a imagem é distribuível, versionada por camada e sobrevive a qualquer purga
por TTL da aplicação — exatamente o tipo de canal de retenção que o §4.10 existe para fechar, e
a mesma classe de problema do achado P0 da Rodada 2 da auditoria. No container o banco nasce
vazio em `/app/data`.

Também excluídos: `.git/`, `dist/`, `.env*`, `artifacts/`, `lib/`, `scripts/`, `.replit`,
`*.md` e ruído de editor/SO.

**`lib/` verificado antes de excluir**, conforme apontado em auditorias anteriores: `grep` por
importações de `lib/` em `server/src`, `client/src` e `shared/` retorna **zero ocorrências**.
Continua órfão. `artifacts/mockup-sandbox/` idem.

---

## 4. Verificação executada

### 4.1 Builds locais (item 6 do pedido) — PASSAM

```
server: npm run build  -> exit 0
  dist/server/src/{index,database}.js, routes/{eemm,formulation,patients,processes}.js,
  services/{formulation,purge}.js, dist/shared/{eemm-types,eemm-processes}.js

client: npm run build  -> exit 0
  dist/index.html (0.39 kB), assets/index-*.css (21.76 kB), assets/index-*.js (185.77 kB)
  39 módulos transformados, 1.31 s
```

### 4.2 Execução do build compilado — PASSA

Não pedido, mas feito porque o Dockerfile depende de premissas que só rodando se confirmam.
O `dist/` do servidor foi executado **fora do ts-node**, com as variáveis do container:

```
DATABASE_PATH=<temp>/dockertest.sqlite PORT=3999 NODE_ENV=production \
CLIENT_DIST_PATH=<repo>/client/dist  node dist/server/src/index.js
```

| Premissa do Dockerfile | Resultado |
|---|---|
| `PORT` respeitada | `GET :3999/health` → `{"ok":true}` |
| `DATABASE_PATH` respeitada | banco criado no caminho indicado, não em `server/` |
| `@shared/*` resolve via `node_modules/@shared` | **sim** — servidor sobe sem `tsconfig-paths` |
| Estrutura do Sprint 5 intacta no build | `GET /api/patients/:id/eemm` → **64 registros** |

Artefatos do teste removidos ao final (processo encerrado, `node_modules/@shared` local e banco
temporário apagados).

### 4.3 Modo dev não regrediu — PASSA

`npm run dev` sem nenhuma variável de ambiente: sobe em `:3001` e usa
`server/database.sqlite`. Os fallbacks preservam o comportamento anterior integralmente.

### 4.4 Revisão estática do Dockerfile (item 5) — dois achados

Cada `COPY` foi conferido contra a estrutura real do repositório. Todos os sete caminhos
existem (`shared/`, `client/package.json`, `client/package-lock.json`, `client/`,
`server/package.json`, `server/package-lock.json`, `server/`), assim como
`client/index.html`, `client/vite.config.ts`, os três `tsconfig` e os 2 arquivos de `shared/`.

Dois riscos que só a revisão estática pegaria:

1. **O `preinstall` da raiz mataria todo `npm ci`.** `package.json` da raiz tem
   `"preinstall"` que faz `exit 1` para qualquer agente que não seja pnpm ("Use pnpm instead").
   Se o Dockerfile copiasse o `package.json` da raiz, **os três `npm ci` falhariam**. Ele não
   copia — cada estágio entra direto em `client/` ou `server/`, que não têm `preinstall`
   próprio. Verificado, não presumido.
2. **Os lockfiles precisam ser autossuficientes.** `npm ci` falha sem lockfile e falha com
   lockfile de workspace com links simbólicos. Ambos são `lockfileVersion: 3`, standalone,
   **zero links de workspace**, com `resolved` em 151/152 e 142/143 entradas. `npm ci` roda
   isolado nos dois pacotes.

### 4.5 Dois defeitos introduzidos por este sprint, achados na auditoria e corrigidos

Ambos vieram da mesma decisão — trocar `start` de `ts-node src/` para
`node dist/server/src/index.js` — e ambos quebrariam o **deploy do Replit**, que roda
`cd server && NODE_ENV=production npm run start`. Nenhum dos dois apareceria no container,
onde o Dockerfile compensa por outro caminho. Foram achados na Rodada 3 da auditoria, ao
exercitar o cenário do `.replit`.

**Defeito 1 — `npm run start` não subia fora do container.**

```
Error: Cannot find module '@shared/eemm-types'
Require stack: .../server/dist/server/src/database.js
```

O `@shared` só resolvia porque o **Dockerfile** criava `node_modules/@shared`. Fora dele, nada
criava. Corrigido movendo o passo para o próprio build, de forma portátil:

```json
"build": "tsc -p tsconfig.build.json && npm run postbuild:alias",
"postbuild:alias": "node -e \"...fs.cpSync('dist/shared','node_modules/@shared',...)\""
```

`fs.cpSync` em vez de `cp -r` porque o build também roda em Windows. O Dockerfile **mantém**
seu próprio `cp`: o `node_modules` da imagem final vem do estágio `server-deps`, não do de
build, e lá o `@shared` não existe.

**Defeito 2 — o build do client não seria servido no layout compilado.**

O fallback era `path.join(__dirname, "..", "..", "client", "dist")`, correto para ts-node
rodando de `src/` e errado para `node` rodando de `dist/server/src/` — apontaria para dentro
de `dist/`. Modo de falha traiçoeiro: o servidor sobe, `/api` responde normalmente, e **toda
rota de página devolve 404**. Corrigido com `resolveClientDist()`, que testa a existência de
`index.html` nos dois candidatos e loga qual escolheu, avisando alto se não achar nenhum.

Verificação após a correção, no cenário exato do `.replit` (sem `CLIENT_DIST_PATH`):

```
[static] servindo build do client de <repo>\client\dist
Server running on port 3998
GET /patients          -> HTTP 200, devolve o index.html do SPA
GET /health            -> {"ok":true}          (/api mantém precedência)
POST /api/patients     -> 201                  (banco no DATABASE_PATH indicado)
```

Registro honesto: o pedido do sprint era preparar a containerização, e a preparação
**introduziu regressão num caminho de execução já existente**. A auditoria a pegou porque
exercitou o cenário do `.replit`, não só o do container.

### 4.6 O que NÃO foi verificado

**O build real do container não foi executado.** Não há daemon Docker neste ambiente.

> **A containerização está PREPARADA E REVISADA ESTATICAMENTE, não concluída e validada.**
>
> Antes de qualquer publicação futura, o usuário precisa rodar, fora deste ambiente:
> ```bash
> docker build -t eemm-artefato .
> ```
> ```bash
> docker run --rm -p 8080:8080 eemm-artefato
> ```
> e confirmar: (a) os três `npm ci` completam; (b) o `better-sqlite3` carrega em runtime —
> é a premissa central da escolha da imagem base e a única que não dá para verificar sem
> construir; (c) `GET /health` responde na porta publicada; (d) a matriz devolve 64 registros;
> (e) o SQLite é criado em `/app/data` e é gravável pelo usuário `node`.

---

## 5. Commits

Todo o estado pendente foi commitado, separado por sprint lógico. Saída de
`git log --oneline -20` reproduzida na Seção 6 da auditoria Rodada 3
([AUDITORIA_METODOLOGIA_R3.md](AUDITORIA_METODOLOGIA_R3.md)), que é onde ela cumpre função
probatória — é a primeira rodada de auditoria capaz de afirmar que o estado auditado
corresponde integralmente a um commit.

---

## 6. Arquivos alterados

| Arquivo | Alteração |
|---|---|
| `Dockerfile` | **Novo** — 4 estágios, node:20-slim, usuário não-root |
| `.dockerignore` | **Novo** — inclui exclusão de `*.sqlite*` por governança de dados |
| `server/tsconfig.build.json` | **Novo** — configuração de emissão com `rootDir` explícito |
| `server/package.json` | `build` passa a emitir; `start` aponta para o JS compilado |
| `server/src/database.ts` | `DATABASE_PATH` com fallback para o caminho histórico |
| `server/src/index.ts` | `PORT` e `CLIENT_DIST_PATH` documentados/configuráveis |

---

## 7. Pendências deixadas em aberto

1. **`docker build` e `docker run` reais**, fora deste ambiente (§4.5). Bloqueante para
   qualquer deploy.
2. **Deploy propriamente dito** — adiado por decisão de custo. Quando ocorrer, o §4.10 precisa
   de reavaliação em pontos que a Rodada 2 já isolou: isolamento de instância (SQLite em disco
   local não sobrevive a múltiplas réplicas nem a filesystem efêmero), política de snapshot da
   plataforma e superfície de variáveis de ambiente — `CASE_TTL_SECONDS` é sobrescrevível, ou
   seja, a política de retenção é alterável por quem controlar o ambiente.
3. **Persistência em plataforma serverless.** Em Cloud Run o filesystem é efêmero e há N
   instâncias: `/app/data/database.sqlite` seria por-instância e perdido a cada scale-to-zero.
   Para uso real de coleta isso precisa de volume persistente ou troca de banco — decisão que
   este sprint não toma, mas registra.
