import { SubstrateEvent } from "@subql/types"
import * as eventHandlers from "../eventHandlers"
import { checkIfAnyBatch, checkIfTransfer, updateAccounts } from "../helpers"

export async function handleEvent(event: SubstrateEvent): Promise<void> {
  const key = `${event.event.section}.${event.event.method}`
  logger.info(key)
  try {
    switch (key) {
      case "balances.BalanceSet":
      case "balances.Deposit":
      case "balances.DustLost":
      case "balances.Endowed":
      case "balances.Reserved":
      case "balances.Slashed":
      case "balances.Unreserved":
      case "balances.Withdraw":
        const isStakingPayout =
          event.extrinsic?.extrinsic.method.section === "staking" &&
          event.extrinsic?.extrinsic.method.method === "payoutStakers"
        const isBatchCall = event.extrinsic && checkIfAnyBatch(event.extrinsic)
        const isTransferCall = event.extrinsic && checkIfTransfer(event.extrinsic)
        if (!isStakingPayout && !isBatchCall && !isTransferCall) {
          const [who] = event.event.data
          await updateAccounts([who.toString()])
        }
        break
      case "transactionPayment.TransactionFeePaid":
        const [whoPaid] = event.event.data
        await updateAccounts([whoPaid.toString()])
        break
      case "balances.Transfer":
        await eventHandlers.transferHandler(event)
        break
      case "nft.NFTCreated":
        await eventHandlers.nftCreatedHandler(event)
        break
      case "nft.SecretAddedToNFT":
        await eventHandlers.secretAddedToNFTHandler(event)
        break
      case "nft.SecretNFTSynced":
        await eventHandlers.secretNFTSyncedHandler(event)
        break
      case "nft.NFTBurned":
        await eventHandlers.nftBurnedHandler(event)
        break
      case "nft.NFTTransferred":
        await eventHandlers.nftTransferHandler(event)
        break
      case "nft.NFTDelegated":
        await eventHandlers.nftDelegatedHandler(event)
        break
      case "nft.NFTRoyaltySet":
        await eventHandlers.nftRoyaltySetHandler(event)
        break
      case "nft.CollectionCreated":
        await eventHandlers.nftCollectionCreatedHandler(event)
        break
      case "nft.CollectionBurned":
        await eventHandlers.nftCollectionBurnedHandler(event)
        break
      case "nft.CollectionClosed":
        await eventHandlers.nftCollectionClosedHandler(event)
        break
      case "nft.CollectionLimited":
        await eventHandlers.nftCollectionLimitedHandler(event)
        break
      case "nft.CollectionOffchainDataSet":
        await eventHandlers.nftCollectionOffchainDataSetHandler(event)
        break
      case "nft.NFTAddedToCollection":
        await eventHandlers.nftAddedToCollectionHandler(event)
        break
      case "nft.NFTConvertedToCapsule":
        await eventHandlers.nftConvertedToCapsuleHandler(event)
        break
      case "nft.CapsuleOffchainDataSet":
        await eventHandlers.capsuleOffchainDataSetHandler(event)
        break
      case "nft.CapsuleSynced":
        await eventHandlers.capsuleSyncedHandler(event)
        break
      case "nft.CapsuleReverted":
        await eventHandlers.capsuleReverted(event)
        break
      case "nft.CapsuleKeyUpdateNotified":
        await eventHandlers.capsuleKeyUpdateNotified(event)
        break
      case "transmissionProtocols.ProtocolSet":
        await eventHandlers.protocolSetHandler(event)
        break
      case "transmissionProtocols.ProtocolRemoved":
        await eventHandlers.protocolRemovedHandler(event)
        break
      case "transmissionProtocols.TimerReset":
        await eventHandlers.timerResetHandler(event)
        break
      case "transmissionProtocols.ConsentAdded":
        await eventHandlers.consentAddedHandler(event)
        break
      case "transmissionProtocols.ThresholdReached":
        await eventHandlers.thresholdReachedHandler(event)
        break
      case "transmissionProtocols.Transmitted":
        await eventHandlers.transmittedHandler(event)
        break
      case "rent.ContractCreated":
        await eventHandlers.rentContractCreatedHandler(event)
        break
      case "rent.ContractCanceled":
        await eventHandlers.rentContractCanceledHandler(event)
        break
      case "rent.ContractStarted":
        await eventHandlers.rentContractStartedHandler(event)
        break
      case "rent.ContractRevoked":
        await eventHandlers.rentContractRevokedHandler(event)
        break
      case "rent.ContractOfferCreated":
        await eventHandlers.rentContractOfferCreatedHandler(event)
        break
      case "rent.ContractOfferRetracted":
        await eventHandlers.rentContractOfferRetractedHandler(event)
        break
      case "rent.ContractSubscriptionTermsChanged":
        await eventHandlers.rentContractSubscriptionTermsChangedHandler(event)
        break
      case "rent.ContractSubscriptionTermsAccepted":
        await eventHandlers.rentContractSubscriptionTermsAcceptedHandler(event)
        break
      case "rent.ContractEnded":
        await eventHandlers.rentContractEndedHandler(event)
        break
      case "rent.ContractSubscriptionPeriodStarted":
        await eventHandlers.rentContractSubscriptionPeriodStartedHandler(event)
        break
      case "rent.ContractExpired":
        await eventHandlers.rentContractExpiredHandler(event)
        break
      case "marketplace.MarketplaceCreated":
        await eventHandlers.marketplaceCreatedHandler(event)
        break
      case "marketplace.MarketplaceOwnerSet":
        await eventHandlers.marketplaceOwnerSetHandler(event)
        break
      case "marketplace.MarketplaceKindSet":
        await eventHandlers.marketplaceKindSetHandler(event)
        break
      case "marketplace.MarketplaceConfigSet":
        await eventHandlers.marketplaceConfigSetHandler(event)
        break
      case "marketplace.NFTListed":
        await eventHandlers.nftListedHandler(event)
        break
      case "marketplace.NFTUnlisted":
        await eventHandlers.nftUnlistedHandler(event)
        break
      case "marketplace.NFTSold":
        await eventHandlers.nftSoldHandler(event)
        break
      case "auction.AuctionCreated":
        await eventHandlers.auctionCreatedHandler(event)
        break
      case "auction.AuctionCancelled":
        await eventHandlers.auctionCancelledHandler(event)
        break
      case "auction.AuctionCompleted":
        await eventHandlers.auctionCompletedHandler(event)
        break
      case "auction.BidAdded":
        await eventHandlers.auctionBidAddedHandler(event)
        break
      case "auction.BidRemoved":
        await eventHandlers.auctionBidRemovedHandler(event)
        break
      default:
        break
    }
  } catch (err) {
    logger.error("Error in event " + key + " at block " + event.block.block.header.number.toString())
    logger.error("Error detail " + err)
    if (err.sql) logger.error("Error detail sql " + err.sql)
  }
}
