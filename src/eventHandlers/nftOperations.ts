import { NftEntity, NftOperationEntity } from "../types"
import { CommonEventData, roundPrice } from "../helpers"

export const nftOperationEntityHandler = async (
  record: NftEntity,
  oldOwner: string | null,
  commonEventData: CommonEventData,
  typeOfTransaction: NFTOperation,
  args?: any[],
): Promise<void> => {
  const { blockHash, blockId, eventId, extrinsicId, timestamp } = commonEventData
  const nftOperationRecord = new NftOperationEntity(blockHash + "-" + eventId + "-" + typeOfTransaction)
  nftOperationRecord.blockId = blockId
  nftOperationRecord.extrinsicId = extrinsicId
  nftOperationRecord.nftId = record.id
  nftOperationRecord.royalty = record.royalty
  nftOperationRecord.collectionId = record.collectionId
  nftOperationRecord.from = oldOwner
  nftOperationRecord.timestamp = timestamp
  nftOperationRecord.typeOfTransaction = typeOfTransaction
  switch (typeOfTransaction) {
    case NFTOperation.Created:
      nftOperationRecord.to = record.owner
      nftOperationRecord.price = args[0]
      nftOperationRecord.priceRounded = roundPrice(nftOperationRecord.price)
      break
    case NFTOperation.Burned:
      nftOperationRecord.to = null
      break
    case NFTOperation.Transferred:
    case NFTOperation.ContractNftOwnershipChanged:
      nftOperationRecord.to = record.owner
      break
    case NFTOperation.Transmitted:
      nftOperationRecord.to = record.owner
      nftOperationRecord.transmissionProtocol = args[0]
      break
    case NFTOperation.Delegated:
    case NFTOperation.Undelegated:
      nftOperationRecord.to = record.delegatee
      break
    case NFTOperation.Listed:
      nftOperationRecord.marketplaceId = record.marketplaceId
      nftOperationRecord.price = record.price
      nftOperationRecord.priceRounded = record.priceRounded
      break
    case NFTOperation.Sold:
    case NFTOperation.AuctionCompleted:
    case NFTOperation.AuctionBuyItNow:
      nftOperationRecord.to = record.owner
      nftOperationRecord.marketplaceId = args[0]
      nftOperationRecord.price = args[1]
      nftOperationRecord.priceRounded = roundPrice(nftOperationRecord.price)
      nftOperationRecord.marketplaceCut = args[2]
      nftOperationRecord.marketplaceCutRounded = roundPrice(nftOperationRecord.marketplaceCut)
      nftOperationRecord.royaltyCut = args[3]
      nftOperationRecord.royaltyCutRounded = roundPrice(nftOperationRecord.royaltyCut)
      break
    case NFTOperation.AuctionCreated:
      nftOperationRecord.marketplaceId = args[0]
      nftOperationRecord.auctionStartPrice = args[1]
      nftOperationRecord.auctionStartPriceRounded = roundPrice(nftOperationRecord.auctionStartPrice)
      nftOperationRecord.auctionBuyItNowPrice = args[2]
      nftOperationRecord.auctionBuyItNowPriceRounded =
        nftOperationRecord.auctionBuyItNowPrice && roundPrice(nftOperationRecord.auctionBuyItNowPrice)
      break
    case NFTOperation.BidAdded:
    case NFTOperation.BidRemoved:
      nftOperationRecord.marketplaceId = record.marketplaceId
      nftOperationRecord.price = args[0]
      nftOperationRecord.priceRounded = roundPrice(nftOperationRecord.price)
      break
    case NFTOperation.ContractCreated:
      nftOperationRecord.rentalContractDuration = args[0]
      break
    case NFTOperation.ContractStarted:
      nftOperationRecord.to = record.rentee
      nftOperationRecord.rentalContractStartBlock = args[0]
      nftOperationRecord.rentalContractDuration = args[1]
      nftOperationRecord.rentalContractBlockDuration = args[2]
      nftOperationRecord.rentalContractMaxSubscriptionBlockDuration = args[3]
      nftOperationRecord.rentalContractFeeType = args[4]
      nftOperationRecord.rentalContractFee = args[5]
      nftOperationRecord.rentalContractFeeRounded = args[6]
      break
    case NFTOperation.TransmissionProtocolSet:
    case NFTOperation.TransmissionTimerReset:
    case NFTOperation.TransmissionConsentAdded:
    case NFTOperation.TransmissionThresholdReached:
      nftOperationRecord.transmissionProtocol = args[0]
      nftOperationRecord.transmissionEndBlock = args[1]
      break
  }

  await nftOperationRecord.save()
}

export enum NFTOperation {
  Created = "created",
  Burned = "burned",
  Transferred = "transferred",
  Delegated = "delegated",
  Undelegated = "undelegated",
  RoyaltySet = "royaltySet",
  Sold = "sold",
  Listed = "listed",
  Unlisted = "unlisted",
  AddedToCollection = "addedToCollection",
  Transmitted = "transmitted",
  SecretAdded = "secretAdded",
  SecretSynced = "secretSynced",
  ConvertedToCapsule = "convertedToCapsule",
  CapsuleSynced = "capsuleSynced",
  CapsuleOffchainDataSet = "capsuleOffChainDataSet",
  CapsuleReverted = "capsuleReverted",
  CapsuleKeyUpdateNotified = "capsuleKeyUpdatedNotified",
  AuctionCompleted = "auctionCompleted",
  AuctionBuyItNow = "auctionBuyItNow",
  AuctionCreated = "auctionCreated",
  AuctionCancelled = "auctionCancelled",
  BidAdded = "bidAdded",
  BidRemoved = "bidRemoved",
  ContractCreated = "contractCreated",
  ContractStarted = "contractStarted",
  ContractCancelled = "contractCancelled",
  ContractRevoked = "contractRevoked",
  ContractNftOwnershipChanged = "contractNftOwnershipChanged",
  ContractEnded = "contractEnded",
  ContractExpired = "contractExpired",
  TransmissionProtocolSet = "transmissionProtocolSet",
  TransmissionProtocolRemoved = "transmissionProtocolRemoved",
  TransmissionConsentAdded = "transmissionConsentAdded",
  TransmissionTimerReset = "transmissionTimerReset",
  TransmissionThresholdReached = "transmissionThresholdReached",
}
