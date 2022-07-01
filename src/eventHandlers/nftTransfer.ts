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
  nftOperationRecord.from = oldOwner
  nftOperationRecord.timestamp = commonEventData.timestamp
  nftOperationRecord.typeOfTransaction = typeOfTransaction
  switch (typeOfTransaction) {
    case "create":
      nftOperationRecord.to = record.owner
      break
    case "burn":
      nftOperationRecord.to = "null address"
      break
    case "transfer":
      nftOperationRecord.to = record.owner
      break
    case "delegate":
      nftOperationRecord.to = record.delegatee || "none"
      break
    case "setRoyalty":
      nftOperationRecord.royalty = Number(record.royalty)
      break
    case "addNftToCollection":
      nftOperationRecord.collectionId = record.collectionId
      break
    case "sell":
      nftOperationRecord.to = record.owner
      nftOperationRecord.price = args[0]
      nftOperationRecord.priceRounded = roundPrice(nftOperationRecord.price)
      nftOperationRecord.marketplaceCut = args[1]
      nftOperationRecord.marketplaceCutRounded = roundPrice(nftOperationRecord.marketplaceCut)
      nftOperationRecord.royaltyCut = args[2]
      nftOperationRecord.royaltyCutRounded = roundPrice(nftOperationRecord.royaltyCut)
      break
    case "list":
      nftOperationRecord.marketplaceId = record.marketplaceId
      nftOperationRecord.price = record.price
      nftOperationRecord.priceRounded = record.priceRounded
      nftOperationRecord.commissionFee = args[0]
      nftOperationRecord.commissionFeeRounded = roundPrice(nftOperationRecord.commissionFee) //record.commissionType === "percentage" ? args[0] : roundPrice(nftOperationRecord.commissionFee)
      nftOperationRecord.listingFee = args[1]
      nftOperationRecord.listingFeeRounded = roundPrice(nftOperationRecord.listingFee)
      break
    case "unlist":
      break
  }
  await nftOperationRecord.save()
}
