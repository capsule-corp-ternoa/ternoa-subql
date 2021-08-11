#!/usr/bin/env bash
set -e

[ -z "$APP_HOME" ] && export APP_HOME=$(pwd)
[ -z "$DB_USER" ] && export DB_USER="postgres"
[ -z "$DB_PASS" ] && export DB_PASS="postgres"
[ -z "$DB_DATABASE" ] && export DB_DATABASE="ternoa"
[ -z "$DB_HOST" ] && export DB_HOST="postgres"
[ -z "$DB_PORT" ] && export DB_PORT="5432"
[ -z "$NETWORK_ENDPOINT" ] && export NETWORK_ENDPOINT="wss://dev.chaos.ternoa.com"
[ -z "$TIMEOUT" ] && export TIMEOUT="270"
subql-node -f . --subquery-name=subql-ternoa --network-endpoint $NETWORK_ENDPOINT --timeout $TIMEOUT
