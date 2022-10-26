# 🧐 Ternoa Indexer 
The Indexer is used to transform blockchain data into a queryable GraphQL database. Allowing users and developers to query specific data for various implementations.

The need for an Indexing solution arises due to the unorganised and unstructured manner in which blockchains usually store data making it highly inefficient to read data directly off of the Distributed ledger.

**Table of Contents :**

- [Introduction](#introduction)
  - [Architecture](#architecture)
  - [Error-Reporting](#error-reporting)
- [Installation](#installation)
  - [Pre-Requisites](#pre-requisites)
  - [Install-Indexer](#install-indexer)
  - [Deployment](#deployment)
  - [Add Ons](#add-ons)
    - [Dictionary](#dictionary)
## Introduction

A Blockchain stores data in a very disperesed manner, making it incredibly streneous to query relevant data for a specific usecase. There isn't a native feature/functionality to Identify, sort and query linked data (spanning across multiple blocks).

Blockchain Data aggregation tools are integral for an Multi-chain future. Keeping that in mind, we've created a robust and secure way to index and aggregate data from our blockchain for multi-faceted use.

The indexer scans through each block and records all of the transactions. It then parses all of that data into entities and inserts it into a postgres database. Thus allowing one to leverage relevant data according to their specific search filters in a simplified manner.

Ternoa deploys its own indexer, however one can run their own if needed.

### Architecture

The Indexer goes block by block and parses all the data into a managed Postgress Database.

It's composed of a GraphQL API alongside a Worker which handles the Indexing. This Duo is hosted on a Virtual Machine.

The Indexer is currently hosted on a single VM. It'll later be upscaled to version with 'n' number of Indexer APIs and Indexer Workers hosted across multiple VMs with Load balancers to optimize the entire process.

### Error Reporting
If you encounter any errors along the way, technical or otherwise. Let us know and we'll deal with it swiftly.
It'll help us further improve the overall experience for our users.
- Open a discussion of type `General` in the [Discussions section](https://github.com/capsule-corp-ternoa/ternoa-subql/discussions) if you encounter any unexpected behaviour.
- Open a Bug report using the [bug template](https://github.com/capsule-corp-ternoa/ternoa-subql/issues/new) if the bug persists.
- If you can, suggest a fix in a pull request to resolve that issue.

## Installation

### Pre Requisites :
* Yarn `Installed`
* Docker and Docker-Compose `Installed and Running`

### Install Indexer :

To index the desired network, make sure to chose the same version for the Dictionary you're using for the Indexer to ensure compatibility. After that, follow the steps which we've underlined below for a seamless experience.

Supported network environments:

- `v43/mainnet` for Mainnet
- `v43/alphanet` for Alphanet

#### 1. Clone the Repository

Clone this repository by running this command :

```
git clone https://github.com/capsule-corp-ternoa/ternoa-subql.git
```

#### 2. Change Directory

Change the Directory for the desired results : 
```
cd ternoa-subql
```

#### 3. Select Network Environment

Select the appropriate network version which corresponds to the `Dictionary` version you're  to ensure compatibility :

Move to the appropriate branch depending on the targeted network environment:

- `v43/mainnet` for Mainnet
- `v43/alphanet` for Alphanet

For example :
```
git checkout v43/alphanet
# The indexer and dictionary should be on same version.
```

#### 4. Install Dependencies

Install the required dependencies for the project using :

```
yarn install
```
#### 5. Generate Type from GraphQL

Generate Types from your GraphQL schema and Operations :

```
yarn codegen
```

#### 6. Build your Implementation

Create an Executable version of your project :
    
```
yarn build
```

#### 7. Docker pull

Pull the latest versions of the Docker image using :

```
docker-compose pull
```

#### 8. Run 

Run your compiled app with Docker using :

```
docker-compose up
```
`Wait a few seconds for the indexing to start, then you can check the blockchain data in your local graphql playground.` 

### Deployment

Deployment of the Indexer on a Virtual Machine requires the installation and set up of NodeJS to buld and run the implementation, and a Postgres Database to store the indexed Data.

### Add Ons

#### Dictionary

[Ternoa Dictionary](https://github.com/capsule-corp-ternoa/ternoa-subql-dictionary) records all the native substrate on-chain data of the Ternoa blockchain. It's essentially a glossary of data that pre-indexes chain events, drastically improving the overall indexing performance.

The Dictionary works in tandem with the Indexer and acts as the middleman between the Blockchain and the Indexer. This allows the Indexer to query a block's metadata from the dictionary, allowing one to query blocks for specific events and only return the required blocks.