import { NftEntity, NftOperationEntity } from "../types"
import { CommonEventData, roundPrice } from "../helpers"

export const nftOperationEntityHandler = async (
  record: NftEntity,
  oldOwner: string,
  commonEventData: CommonEventData,
  typeOfTransaction: string,
  args?: any[],
): Promise<void> => {
  const nftOperationRecord = new NftOperationEntity(commonEventData.blockHash + "-" + commonEventData.eventId)
  nftOperationRecord.blockId = commonEventData.blockId
  nftOperationRecord.extrinsicId = commonEventData.extrinsicId
  nftOperationRecord.nftId = record.id
  nftOperationRecord.royalty = record.royalty
  nftOperationRecord.collectionId = record.collectionId
  nftOperationRecord.from = oldOwner
  nftOperationRecord.timestamp = commonEventData.timestamp
  nftOperationRecord.typeOfTransaction = typeOfTransaction
  switch (typeOfTransaction) {
    case NFTOperation.Create:
      nftOperationRecord.to = record.owner
      break
    case NFTOperation.Burn:
      nftOperationRecord.to = null
      break
    case NFTOperation.Transfer:
      nftOperationRecord.to = record.owner
      break
    case NFTOperation.Delegate:
    case "undelegate":
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
      break
    case NFTOperation.AddBid:
    case NFTOperation.RemoveBid:
      nftOperationRecord.marketplaceId = record.marketplaceId
      nftOperationRecord.price = args[0]
      nftOperationRecord.priceRounded = roundPrice(nftOperationRecord.price)
      break
  }
  await nftOperationRecord.save()
}

export enum NFTOperation {
  Create = "create",
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
}