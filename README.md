# ⛓ Ternoa Indexer

Ternoa Indexer scans through each block and their events to see what happened on the Ternoa chain. It then parses all that data into custom entities and store them inside a queryable GraphQL database. Allowing users and developers to query specific filtered in a simplified manner data for various implementations.

Ternoa deploys its own indexer for the Mainnet network [here](https://indexer-mainnet.ternoa.dev/).

> Since Ternoa Incexer is based on the **[SubQuery Framework](https://doc.subquery.network/)**, you can get more information on the **[SubQuery official documentation](https://doc.subquery.network/faqs/faqs.html)**.

**Table of Contents :**

- [Introduction](#introduction)
  - [Error-Reporting](#error-reporting)
- [Installation](#installation)
- [Code Architecture](#code-architecture)

## Introduction

**Ternoa is a Decentralised, Open source, NFT-centric Layer 1 blockchain that is multi-chain by design and aims to provide a technical stack to build scalable and secure NFTs with native support for advanced features.**

#### For Builders By Builders

NFTs native to our chain can be minted using High-level programming languages and doesn't require smart contract functionality.

#### Native support for Advanced Features

With native support for Secret NFTs, Delegating and Lending, Transaction Batching and much more, you might want to give it a try.

### Error Reporting

If you encounter any errors along the way, technical or otherwise. Let us know and we'll deal with it swiftly.
It'll help us further improve the overall experience for our users.

- Open a discussion of type `General` in the [Discussions section](https://github.com/capsule-corp-ternoa/ternoa-subql/discussions) if you encounter any unexpected behaviour.
- Open a Bug report using the [bug template](https://github.com/capsule-corp-ternoa/ternoa-subql/issues/new) if the bug persists.
- If you can, suggest a fix in a pull request to resolve that issue.

## Installation

> #### Pre requisites
>
> Have **yarn** installed, **docker** and **docker-compose** installed and running on your machine.

If you check **[our repository](https://github.com/capsule-corp-ternoa/ternoa-subql)**, you will see that we have many branches.
Each branch correspond to a chain spec version and a chain network:

- **mainnet** for the Mainnet Network
- **alphanet** for the Alphanet Network
- **dev** for the Developement Networks
- others refers to the old Testnet Network (soon deprecated))

### Run an indexer

The example below use the Alphanet Network:

```bash
git clone https://github.com/capsule-corp-ternoa/ternoa-subql.git
cd ternoa-subql
git checkout alphanet
yarn install
yarn codegen
yarn build
```

Every time the graphQl Schema change, you need to run the yarn codegen command.
Every time the code change, you need to build it again with the yarn build command.
Now everything is built, you can launch it on with docker.

```bash
docker-compose pull
docker-compose up
```

docker-compose pull need to be run to pull the last version and does not need to be ran again, unless you change any docker image.

> After a few seconds, the indexing starts. You can see in the shell every blocks indexed. To check the blockchain data stored, run a query in your local graphql playground in a browser (default **[localhost:3000](http://localhost:3000)**).
> More documentation on basic queries is available [here](https://docs.ternoa.network/for-developers/indexer/queries/basic-queries).

### Deployment

Documentation on how to deploy Indexer is available [here](https://docs.ternoa.network/for-developers/indexer/deployment).

### Dictionary

Ternoa Dictionary records all the native substrate on-chain data of the Ternoa blockchain: blocks, extrinsics, and events. It is a glossary of data that pre-indexes chain events, drastically improving the overall indexing performance. Unlike the Indexer, no data relating to the Ternoa pallets is covered by the Dictionary.

Ternoa deploys its own indexer [here](https://dictionary-mainnet.ternoa.dev/) on which you can submit GraphQL queries to retrieve on-chain data.
More information on Dictionary is available [here](https://docs.ternoa.network/for-developers/indexer/dictionary/).

#### Add the dictionary to indexer

You can couple a dictionnary to the indexer inside the [project.yaml](/capsule-corp-ternoa/ternoa-subql/blob/mainnet/project.yaml) file, in the network section. In the example below we use the Mainnet network Ternoa Dictionary available [here](https://dictionary-mainnet.ternoa.dev/).

```yaml
###
schema:
  file: ./schema.graphql
network:
  genesisHash: "0x6859c81ca95ef624c9dfe4dc6e3381c33e5d6509e35e147092bfbc780f777c4e"
  endpoint: wss://mainnet.ternoa.network
  dictionary: https://dictionary-mainnet.ternoa.dev/
###
```

## Code Architecture

Ternoa Indexer integrates the main features from the Ternoa pallets. The most important concepts are:

### Setup

Configuration is setup in the [project.yaml](/capsule-corp-ternoa/ternoa-subql/blob/mainnet/project.yaml) file. It constains chain wss endpoint, the genesis hash, the types file, and the different filter to get only the specific events / extrinsics needed. We can also filter on the success status of the event / extrinsic (More details on the **[subquery documentation](https://doc.subquery.network/build/manifest/polkadot.html)**).

### Schema

The parsed data is structured in GraphQL entities specified in the [schema.graphql](/capsule-corp-ternoa/ternoa-subql/blob/mainnet/schema.graphql) file. These entities contain the form of the data stored in the database.

### Mappings

[mappingHandlers](/capsule-corp-ternoa/ternoa-subql/blob/mainnet/src/mappings/mappingHandlers.ts) will map listened events with the corresponding handlers to parse on-chain data according to the specified GraphQL entities (More info in the **[subquery documentation](https://academy.subquery.network/build/mapping/polkadot.html)**).

### Events handlers

[eventHandlers](/capsule-corp-ternoa/ternoa-subql/blob/mainnet/src/eventHandlers) folder contains the handlers sorted by pallets.
