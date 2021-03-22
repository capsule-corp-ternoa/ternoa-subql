# Manage indexer deployment on the host machine

Start or update the whole setup:

    docker-compose pull
    docker-compose up -d

Stop the whole setup:

    docker-compose down

Restart only one component:

    docker-compose restart ternoa|graphql|subquery

See logs:

    docker-compose logs -f
    docker-compose logs -f  ternoa|graphql|subquery

Hard reset containers data:

    docker-compose down
    rm -rf .data/ternoa-node|postgres|letsencrypt
    docker-compose up -d

# Additional environment variables

A file named `.env` must be placed next to the `docker-compose.yml` and need to contain the following variables:
```
LETSENCRYPT_ACME_EMAIL=test@example.com
POSTGRES_DB_PASSWORD=XXXXX
WEBHOOK_URL=https://hooks.slack.com/XXXX
```
