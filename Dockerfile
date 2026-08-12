# =============================================================================
# Artefato de formulação de caso EEMM — imagem de produção
# =============================================================================
#
# BASE: node:20-slim (Debian, glibc) — NÃO alpine.
#
# Motivo, verificado no repositório e não presumido: `better-sqlite3@12.8.0` é
# módulo NATIVO. Seu script de instalação é `prebuild-install || node-gyp rebuild
# --release` — ou seja, tenta baixar um binário pré-compilado e, se não achar,
# compila na hora. Os prebuilds publicados são para glibc; em alpine/musl o
# prebuild-install não encontra binário compatível e cai para o node-gyp, que numa
# imagem alpine sem toolchain falha — e, pior, falha de formas que às vezes só
# aparecem em runtime, ao carregar o .node. Debian slim evita a classe inteira de
# problema por ~40 MB a mais de imagem.
#
# Os estágios de build instalam python3/make/g++ mesmo assim, para que a compilação
# via node-gyp funcione caso o prebuild não esteja disponível. O estágio final NÃO
# leva o toolchain.
#
# ATENÇÃO: esta imagem NÃO foi construída nem executada. Foi escrita e revisada
# estaticamente (ambiente de desenvolvimento sem daemon Docker). Ver SPRINT_6_LOG.md.
# =============================================================================


# -----------------------------------------------------------------------------
# Estágio 1 — build do client (Vite → client/dist)
# -----------------------------------------------------------------------------
FROM node:20-slim AS client-build
WORKDIR /app

# `shared/` entra ANTES do npm ci porque client/tsconfig.json faz
# `"include": ["src", "../shared"]` e vite.config.ts resolve o alias @shared para
# ../shared. Sem esse diretório o `tsc` do script de build falha.
COPY shared/ ./shared/

WORKDIR /app/client
COPY client/package.json client/package-lock.json* ./
RUN npm ci

COPY client/ ./
RUN npm run build
# Resultado: /app/client/dist


# -----------------------------------------------------------------------------
# Estágio 2 — build do server (TypeScript → server/dist)
# -----------------------------------------------------------------------------
FROM node:20-slim AS server-build
WORKDIR /app

RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ \
 && rm -rf /var/lib/apt/lists/*

COPY shared/ ./shared/

WORKDIR /app/server
COPY server/package.json server/package-lock.json* ./
RUN npm ci

COPY server/ ./
RUN npm run build
# `npm run build` = `tsc -p tsconfig.build.json`, que emite com rootDir=".." e
# produz exatamente:
#     /app/server/dist/server/src/index.js   <- ponto de entrada
#     /app/server/dist/shared/*.js           <- alvo do alias @shared/*
# Layout confirmado por build local antes de escrever este arquivo.


# -----------------------------------------------------------------------------
# Estágio 3 — dependências de produção (node_modules sem devDependencies)
# -----------------------------------------------------------------------------
# Estágio separado do runtime de propósito: `npm ci --omit=dev` reexecuta o script
# de instalação do better-sqlite3, que pode precisar compilar. Fazer isso aqui
# mantém o toolchain (python3/make/g++) FORA da imagem final, sem abrir mão de um
# node_modules construído para linux — que é o ponto: o .node do host Windows é
# inútil no container, e o .dockerignore garante que ele nem seja copiado.
FROM node:20-slim AS server-deps
WORKDIR /app/server

RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ \
 && rm -rf /var/lib/apt/lists/*

COPY server/package.json server/package-lock.json* ./
RUN npm ci --omit=dev


# -----------------------------------------------------------------------------
# Estágio 4 — runtime
# -----------------------------------------------------------------------------
FROM node:20-slim AS runtime
ENV NODE_ENV=production

WORKDIR /app/server

COPY --from=server-deps /app/server/node_modules ./node_modules
COPY --from=server-build /app/server/dist ./dist
COPY --from=server-build /app/server/package.json ./package.json
COPY --from=client-build /app/client/dist /app/client/dist

# Resolução do alias @shared/* em produção.
#
# O JS emitido conserva `require("@shared/eemm-types")`. Em vez de carregar
# tsconfig-paths em runtime (dependência extra + hook de resolução no processo de
# produção), o diretório compilado é exposto como um pacote em node_modules e a
# resolução nativa do Node dá conta sozinha.
#
# `npm run build` já faz isso (script `postbuild:alias`), mas o passo precisa ser
# repetido AQUI: o node_modules desta imagem não vem do estágio de build, vem do
# `server-deps` — e lá o `@shared` não existe. Sem esta linha o container sobe e
# morre no primeiro require. Verificado nos dois caminhos.
RUN cp -r ./dist/shared ./node_modules/@shared

# Diretório de dados: o SQLite precisa de local gravável FORA da árvore de código.
# `node:20-slim` já traz o usuário não-root `node` (uid 1000); a imagem roda como
# ele, então o diretório precisa pertencer a ele explicitamente — criado por root,
# ficaria somente-leitura para o processo.
RUN mkdir -p /app/data && chown -R node:node /app/data
ENV DATABASE_PATH=/app/data/database.sqlite

# Caminho do build do client. Não é derivável de __dirname aqui: o servidor roda de
# dist/server/src/, e o `path.join(__dirname, "..", "..", "client", "dist")` do
# fallback apontaria para dentro de dist/. Por isso a variável.
ENV CLIENT_DIST_PATH=/app/client/dist

# PORT é lida por src/index.ts (`Number(process.env.PORT) || 3001`). O EXPOSE é
# documental; a plataforma injeta a porta real e o servidor a respeita.
ENV PORT=8080
EXPOSE 8080

USER node

CMD ["node", "dist/server/src/index.js"]
