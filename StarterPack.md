# SubQuery - Starter Package


This **Starter Package** is an example that you can use as a starting point for developing your SubQuery project, essentially a DIY SubQuery project.

A SubQuery package defines which data `SubQuery` will index and store from the `Substrate blockchain`. 

## Preparation

#### Environment :

- [Typescript](https://www.typescriptlang.org/) are required to compile project and define types.  

- Both SubQuery CLI and generated Project have dependencies and require [Node](https://nodejs.org/en/).
     

#### Install the SubQuery CLI :

Install SubQuery CLI globally on your terminal using NPM:

```
npm install -g @subql/cli
```

Run help to get available commands and usage provided by CLI :

```
subql help
```

## Initialize the starter package

Inside the directory in which you want to create the SubQuery project, simply replace `project-name` with your project name and run the command:

```
subql init --starter project-name
```

Then you should see a folder with your project name has been created inside the directory. You can use this as the start point of your project and the files should be identical as in the [Directory Structure](https://doc.subquery.network/directory_structure.html).

Lastly, Run the following command under the project directory to install all necessary dependencies.

```
yarn install
```


## Configure your project

In the starter package, we have provided a simple example of project configuration. You will be mainly working on the following files :

- The Manifest in `project.yaml`
- The GraphQL Schema in `schema.graphql`
- The Mapping functions in `src/mappings/` directory

For more information on how to write the SubQuery, check out our doc section on [Define SubQuery](https://doc.subquery.network/define_a_subquery.html) 

#### Code generation :

In order to index your SubQuery project, it is mandatory to build your project first.

Run this command under the project directory.

````
yarn codegen
````

## Build the project

In order to deploy your SubQuery project to our hosted service, it is mandatory to pack your configuration before uploading.

Initiating the pack command from of your project's root directory will automatically generate a `your-project-name.tgz` file.

```
yarn build
```

## Indexing and Query

**We recommended you to do it without Docker.**

### Indexer (subql/node)

Make sure that your postgresql database is installed and then export the configuration.

```bash
export DB_USER=postgres
export DB_PASS=postgres
export DB_DATABASE=ternoa
export DB_HOST=postgres
export DB_PORT=5432
```

Afterwards,

```bash
npm install -g @subql/node
yarn
yarn build
subql-node -f . --db-schema=subql_ternoa --network-endpoint wss://dev.chaos.ternoa.com
```

**On the last line, you can effortlessly switch from dev.chaos, to any other network endpoint.**

### Running a Query Service (subql/query)

Same as the previous step, make sure that your postgresql database is installed, and export the configuration.

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
yarn
yarn build
subql-query --name subql_ternoa --playground
```

#### Run required systems in docker :

First open `docker-compose.yml`, in the `graphql-engine` section and make sure the project name is identical to what you previously provided.

````yaml
command:
  - '--name'
  - 'subql-starter' #Same as your project name
  - '--playground'
````

Then, under the project directory run following command:

```
docker-compose up
```

#### Query the project :

Open your browser and head to `http://localhost:3000`.


You should see a GraphQL playground in the explorer and the schemas that are ready to be queried.

For the `subql-starter` project, you can try to query data using the following code to get a taste of how it works.

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
