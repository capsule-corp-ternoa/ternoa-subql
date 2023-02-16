#!/usr/bin/env bash
set -e
set -x

[ -z "$APP_HOME" ] && export APP_HOME=$(pwd)

[ -z "$POSTGRESQL_ADDON_USER" ] && export POSTGRESQL_ADDON_USER="postgres"
[ -z "$DB_USER" ] && export DB_USER="$POSTGRESQL_ADDON_USER"

[ -z "$POSTGRESQL_ADDON_PASSWORD" ] && export POSTGRESQL_ADDON_PASSWORD="postgres"
[ -z "$DB_PASS" ] && export DB_PASS="$POSTGRESQL_ADDON_PASSWORD"

[ -z "$POSTGRESQL_ADDON_DB" ] && export POSTGRESQL_ADDON_DB="postgres"
[ -z "$DB_DATABASE" ] && export DB_DATABASE="$POSTGRESQL_ADDON_DB"

[ -z "$POSTGRESQL_ADDON_HOST" ] && export POSTGRESQL_ADDON_HOST="localhost"
[ -z "$DB_HOST" ] && export DB_HOST="$POSTGRESQL_ADDON_HOST"

[ -z "$POSTGRESQL_ADDON_PORT" ] && export POSTGRESQL_ADDON_PORT="5432"
[ -z "$DB_PORT" ] && export DB_PORT="$POSTGRESQL_ADDON_PORT"

env | grep DB_

if [ -z $1 ]; then
    echo "Provide a network name (e.g. 'betanet', 'alphanet' or 'mainnet')"
    exit 1
fi

sh ./scripts/prepare_folders.sh

cd ./networks/$1

# ----Installing Subql-Query----
npm install -g @subql/query@1.8.0

# ----Installing Subql-Node----
npm install -g @subql/node@1.16.0

# ----Installing dependencies----
npm install

# ----Codegen Ternoa-Subql----
npm run codegen

# ----Building Ternoa-Subql----
npm run build

