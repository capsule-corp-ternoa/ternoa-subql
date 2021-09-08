# SubQuery - Starter Package


The Starter Package is an example that you can use as a starting point for developing your SubQuery project.
A SubQuery package defines which data The SubQuery will index from the Substrate blockchain, and how it will store it. 

## Preparation

#### Environment

- [Typescript](https://www.typescriptlang.org/) are required to compile project and define types.  

- Both SubQuery CLI and generated Project have dependencies and require [Node](https://nodejs.org/en/).
     
## How to deploy

Recommended way is to do it without Docker.

### Indexer (subql/node)

Be sure that your postgresql database is installed, and export the configuration

```bash
export DB_USER=postgres
export DB_PASS=postgres
export DB_DATABASE=ternoa
export DB_HOST=postgres
export DB_PORT=5432
```

Then,

```bash
npm install -g @subql/node
npm install
npm run build
subql-node -f . --subquery-name=subql-ternoa --network-endpoint wss://dev.chaos.ternoa.com
```

On the last line, you can Obviously switch from dev.chaos, to any other network endpoint.

### Running a Query Service (subql/query)

Same as the previous step, be sure that your postgresql database is installed, and export the configuration

```bash
export DB_USER=postgres
export DB_PASS=postgres
export DB_DATABASE=ternoa
export DB_HOST=postgres
export DB_PORT=5432
```

Then,

```bash
npm install -g @subql/query
npm install
npm run build
subql-query --name subql-ternoa --playground
```

## Query the project

Open your browser and head to `http://localhost:3000`.

Finally, you should see a GraphQL playground is showing in the explorer and the schemas that ready to query.

For the `subql-starter` project, you can try to query with the following code to get a taste of how it works.

````graphql
{
  query{
    starterEntities(first:10){
      nodes{
        field1,
        field2,
        field3
      }
    }
  }
}
````
