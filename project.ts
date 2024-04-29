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
      "0x18bcdb75a0bba577b084878db2dc2546eb21504eaad4b564bb7d47f9d02b6ace",
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
          // Balance
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "balances",
              method: "BalanceSet",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "balances",
              method: "Deposit",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "balances",
              method: "DustLost",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "balances",
              method: "Endowed",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "balances",
              method: "Reserved",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "balances",
              method: "Slashed",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "balances",
              method: "Unreserved",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "balances",
              method: "Withdraw",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "balances",
              method: "Transfer",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "transactionPayment",
              method: "TransactionFeePaid",
            },
          },
          // NFT
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "nft",
              method: "NFTCreated",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "nft",
              method: "NFTBurned",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "nft",
              method: "NFTTransferred",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "nft",
              method: "NFTDelegated",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "nft",
              method: "NFTRoyaltySet",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "marketplace",
              method: "NFTListed",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "marketplace",
              method: "NFTUnlisted",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "marketplace",
              method: "NFTSold",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "nft",
              method: "NFTAddedToCollection",
            },
          },
          // Secret NFT
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "nft",
              method: "SecretAddedToNFT",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "nft",
              method: "SecretNFTSynced",
            },
          },
          // Capsule NFT
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "nft",
              method: "NFTConvertedToCapsule",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "nft",
              method: "CapsuleOffchainDataSet",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "nft",
              method: "CapsuleSynced",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "nft",
              method: "CapsuleReverted",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "nft",
              method: "CapsuleKeyUpdateNotified",
            },
          },
          // Transmission Protocols
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "transmissionProtocols",
              method: "ProtocolSet",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "transmissionProtocols",
              method: "ProtocolRemoved",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "transmissionProtocols",
              method: "TimerReset",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "transmissionProtocols",
              method: "ConsentAdded",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "transmissionProtocols",
              method: "ThresholdReached",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "transmissionProtocols",
              method: "Transmitted",
            },
          },
          // Collection
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "nft",
              method: "CollectionCreated",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "nft",
              method: "CollectionBurned",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "nft",
              method: "CollectionClosed",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "nft",
              method: "CollectionLimited",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "nft",
              method: "CollectionOffchainDataSet",
            },
          },
          // Marketplace
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "marketplace",
              method: "MarketplaceCreated",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "marketplace",
              method: "MarketplaceOwnerSet",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "marketplace",
              method: "MarketplaceKindSet",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "marketplace",
              method: "MarketplaceConfigSet",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "marketplace",
              method: "MarketplaceMintFeeSet",
            },
          },
          // Rent
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "rent",
              method: "ContractCreated",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "rent",
              method: "ContractCanceled",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "rent",
              method: "ContractStarted",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "rent",
              method: "ContractRevoked",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "rent",
              method: "ContractOfferCreated",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "rent",
              method: "ContractOfferRetracted",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "rent",
              method: "ContractSubscriptionTermsChanged",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "rent",
              method: "ContractSubscriptionTermsAccepted",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "rent",
              method: "ContractEnded",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "rent",
              method: "ContractSubscriptionPeriodStarted",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "rent",
              method: "ContractExpired",
            },
          },
          // Auction
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "auction",
              method: "AuctionCreated",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "auction",
              method: "AuctionCancelled",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "auction",
              method: "AuctionCompleted",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "auction",
              method: "BidAdded",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "auction",
              method: "BidRemoved",
            },
          },
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "auction",
              method: "BalanceClaimed",
            },
          },
          // Misc
          {
            handler: "handleEvent",
            kind: SubstrateHandlerKind.Event,
            filter: {
              module: "associatedAccounts",
              method: "UserAccountAdded",
            },
          },

        ],
      },
    },
  ],
};

// Must set default to the project instance
export default project;
