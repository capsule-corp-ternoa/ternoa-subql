import { NftEntity, NftOperationEntity } from "../types"
import { CommonEventData, roundPrice } from "../helpers"

export const nftOperationEntityHandler = async (
  record: NftEntity,
  oldOwner: string,
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
    case NFTOperation.Create:
      nftOperationRecord.to = record.owner
      break
    case NFTOperation.Burn:
      nftOperationRecord.to = null
      break
    case NFTOperation.Transfer:
    case NFTOperation.RentalContractNftOwnershipChange:
      nftOperationRecord.to = record.owner
      break
    case NFTOperation.Delegate:
    case NFTOperation.Undelegate:
      nftOperationRecord.to = record.delegatee
      break
    case NFTOperation.List:
      nftOperationRecord.marketplaceId = record.marketplaceId
      nftOperationRecord.price = record.price
      nftOperationRecord.priceRounded = record.priceRounded
      nftOperationRecord.commissionFeeType = args[0]
      nftOperationRecord.commissionFee = args[1]
      nftOperationRecord.commissionFeeRounded = args[2]
      nftOperationRecord.listingFeeType = args[3]
      nftOperationRecord.listingFee = args[4]
      nftOperationRecord.listingFeeRounded = args[5]
      break
    case NFTOperation.Sell:
    case NFTOperation.CompleteAuction:
    case NFTOperation.BuyItNowAuction:
      nftOperationRecord.to = record.owner
      nftOperationRecord.marketplaceId = args[0]
      nftOperationRecord.price = args[1]
      nftOperationRecord.priceRounded = roundPrice(nftOperationRecord.price)
      nftOperationRecord.marketplaceCut = args[2]
      nftOperationRecord.marketplaceCutRounded = roundPrice(nftOperationRecord.marketplaceCut)
      nftOperationRecord.royaltyCut = args[3]
      nftOperationRecord.royaltyCutRounded = roundPrice(nftOperationRecord.royaltyCut)
      break
    case NFTOperation.CreateAuction:
      nftOperationRecord.marketplaceId = args[0]
      nftOperationRecord.auctionStartPrice = args[1]
      nftOperationRecord.auctionStartPriceRounded = roundPrice(nftOperationRecord.auctionStartPrice)
      nftOperationRecord.auctionBuyItNowPrice = args[2]
      nftOperationRecord.auctionBuyItNowPriceRounded =
        nftOperationRecord.auctionBuyItNowPrice && roundPrice(nftOperationRecord.auctionBuyItNowPrice)
      break
    case NFTOperation.AddBid:
    case NFTOperation.RemoveBid:
      nftOperationRecord.marketplaceId = record.marketplaceId
      nftOperationRecord.price = args[0]
      nftOperationRecord.priceRounded = roundPrice(nftOperationRecord.price)
      break
    case NFTOperation.RentalContractCreated:
      nftOperationRecord.rentalContractDuration = args[0]
      break
    case NFTOperation.RentalContractStarted:
      nftOperationRecord.to = record.rentee
      nftOperationRecord.rentalContractStartBlock = args[0]
      nftOperationRecord.rentalContractDuration = args[1]
      nftOperationRecord.rentalContractBlockDuration = args[2]
      nftOperationRecord.rentalContractMaxSubscriptionBlockDuration = args[3]
      nftOperationRecord.rentalContractFeeType = args[4]
      nftOperationRecord.rentalContractFee = args[5]
      nftOperationRecord.rentalContractFeeRounded = args[6]
      break
  }

  await nftOperationRecord.save()
}

export enum NFTOperation {
  Create = "create",
  AddSecret = "addSecret",
  SecretSynced = "secretSynced",
  Burn = "burn",
  Transfer = "transfer",
  Delegate = "delegate",
  Undelegate = "undelegate",
  SetRoyalty = "setRoyalty",
  Sell = "sell",
  List = "list",
  Unlist = "unlist",
  CompleteAuction = "completeAuction",
  BuyItNowAuction = "buyItNowAuction",
  CreateAuction = "createAuction",
  AddBid = "addBid",
  RemoveBid = "removeBid",
  CancelAuction = "cancelAuction",
  AddToCollection = "addToCollection",
  RentalContractCreated = "rentalContractCreated",
  RentalContractStarted = "rentalContractStarted",
  RentalContractCanceled = "rentalContractCanceled",
  RentalContractRevoked = "rentalContractRevoked",
  RentalContractNftOwnershipChange = "rentalContractNftOwnershipChange",
  RentalContractEnded = "rentalContractEnded",
  RentalContractExpired = "rentalContractExpired",
}
