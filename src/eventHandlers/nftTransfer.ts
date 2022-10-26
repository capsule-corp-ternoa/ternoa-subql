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
    case "create":
      nftOperationRecord.to = record.owner
      break
    case "burn":
      nftOperationRecord.to = null
      break
    case "transfer":
      nftOperationRecord.to = record.owner
      break
    case "delegate":
    case "undelegate":
      nftOperationRecord.to = record.delegatee
      break
    case "list":
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
    case "sell":
    case "completeAuction":
    case "buyItNowAuction":
      nftOperationRecord.to = record.owner
      nftOperationRecord.marketplaceId = args[0]
      nftOperationRecord.price = args[1]
      nftOperationRecord.priceRounded = roundPrice(nftOperationRecord.price)
      nftOperationRecord.marketplaceCut = args[2]
      nftOperationRecord.marketplaceCutRounded = roundPrice(nftOperationRecord.marketplaceCut)
      nftOperationRecord.royaltyCut = args[3]
      nftOperationRecord.royaltyCutRounded = roundPrice(nftOperationRecord.royaltyCut)
      break
    case "createAuction":
      nftOperationRecord.marketplaceId = args[0]
      break
    case "addBid":
    case "removeBid":
      nftOperationRecord.marketplaceId = record.marketplaceId
      nftOperationRecord.price = args[0]
      nftOperationRecord.priceRounded = roundPrice(nftOperationRecord.price)
      break
  }
  await nftOperationRecord.save()
}
