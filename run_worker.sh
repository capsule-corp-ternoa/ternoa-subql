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

[ -z "$NETWORK_ENDPOINT" ] && export NETWORK_ENDPOINT="wss://dev.chaos.ternoa.com"
[ -z "$TIMEOUT" ] && export TIMEOUT="270"

#npm install -g @subql/node
npm i --save-dev @types/jest
cd subql
git checkout main
cd packages/node
npm install
npm run build

subql-node -f . --subquery-name=subql-ternoa --network-endpoint $NETWORK_ENDPOINT --timeout $TIMEOUT --network-dictionary=https://api.subquery.network/sq/subquery/dictionary-polkadot
