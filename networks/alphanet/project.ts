import {
  SubstrateDatasourceKind,
  SubstrateHandlerKind,
  SubstrateProject,
} from "@subql/types";

// Can expand the Datasource processor types via the genreic param
const project: SubstrateProject = {
  specVersion: "1.0.0",
  version: "1.0.0",
  name: "Ternoa Indexer",
  description:
    "Ternoa Indexer: Indexes main events triggered by the Ternoa blockchain",
  runner: {
    node: {
      name: "@subql/node",
      version: ">=3.0.1",
    },
    query: {
      name: "@subql/query",
      version: "*",
    },
  },
  schema: {
    file: "./schema.graphql",
  },
  network: {
    /* The genesis hash of the network (hash of block 0) */
    chainId:
      "0x535f8421af34dfbb87736b3b2231ddb3c598b0b2cd73a4c5e93b13bf6e65f4c0",
    /**
     * These endpoint(s) should be public non-pruned archive node
     * We recommend providing more than one endpoint for improved reliability, performance, and uptime
     * Public nodes may be rate limited, which can affect indexing speed
     * When developing your project we suggest getting a private API key
     * If you use a rate limited endpoint, adjust the --batch-size and --workers parameters
     * These settings can be found in your docker-compose.yaml, they will slow indexing but prevent your project being rate limited
     */
    endpoint: ["wss://alphanet.ternoa.com"],
    dictionary: ["https://dictionary-alphanet.ternoa.dev"],
  },
  dataSources: [
    {
      kind: SubstrateDatasourceKind.Runtime,
      startBlock: 1,
      mapping: {
        file: "./dist/index.js",
        handlers: [
          // Batch Calls
          {
            handler: "accountUpdateHandler",
            kind: SubstrateHandlerKind.Call,
            filter: {
              module: "utility",
              method: "batchAll",
              success: true,
            },
          },
          {
            handler: "accountUpdateHandler",
            kind: SubstrateHandlerKind.Call,
            filter: {
              module: "utility",
              method: "batch",
            },
          },
          {
            handler: "accountUpdateHandler",
            kind: SubstrateHandlerKind.Call,
            filter: {
              module: "utility",
              method: "forceBatch",
            },
          },
          // Staking Calls
          {
            handler: "accountUpdateHandler",
            kind: SubstrateHandlerKind.Call,
            filter: {
              module: "staking",
              method: "payoutStakers",
              success: true,
            },
          },
          // All events
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
          },
        ],
      },
    },
  ],
};

// Must set default to the project instance
export default project;
