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
      nftOperationRecord.marketplaceCut = args[0]
      nftOperationRecord.royaltyCut = args[1]
      nftOperationRecord.price = record.price
      nftOperationRecord.priceRounded = record.priceRounded
      nftOperationRecord.marketplaceCutRounded = roundPrice(nftOperationRecord.marketplaceCut)
      nftOperationRecord.royaltyCutRounded = roundPrice(nftOperationRecord.royaltyCut)
      break
    case "list":
      nftOperationRecord.marketplaceId = record.marketplaceId
      nftOperationRecord.price = record.price
      nftOperationRecord.priceRounded = record.priceRounded
      nftOperationRecord.listingFee = args[0]
      nftOperationRecord.listingFeeRounded = roundPrice(nftOperationRecord.listingFee)
      nftOperationRecord.commissionFee = args[1]
      nftOperationRecord.commissionFeeRounded = roundPrice(nftOperationRecord.commissionFee)
      break
    case "unlist":
      break
  }
  await nftOperationRecord.save()
}
