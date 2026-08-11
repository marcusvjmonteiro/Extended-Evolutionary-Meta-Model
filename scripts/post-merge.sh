#!/bin/bash
set -e
pnpm install --frozen-lockfile

# NOTA (Sprint 2): removida a linha `pnpm --filter db push`.
# Ela empurrava o schema Drizzle/Postgres de lib/db, que NAO e consumido pela
# aplicacao real — server/ e client/ usam SQLite via better-sqlite3, e o unico
# pacote que declarava @workspace/db como dependencia era artifacts/api-server,
# eliminado neste sprint. O filtro `db` sequer casava com o nome real do pacote
# (@workspace/db), de modo que a linha provavelmente derrubava este hook por
# causa do `set -e`.
