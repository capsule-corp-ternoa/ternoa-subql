#!/usr/bin/env bash
set -e

[ -z "$APP_HOME" ] && export APP_HOME=$(pwd)
[ -z "$DB_USER" ] && export DB_USER="postgres"
[ -z "$DB_PASS" ] && export DB_PASS="postgres"
[ -z "$DB_DATABASE" ] && export DB_DATABASE="ternoa"
[ -z "$DB_HOST" ] && export DB_HOST="postgres"
[ -z "$DB_PORT" ] && export DB_PORT="5432"

subql-query --name subql-ternoa --playground
