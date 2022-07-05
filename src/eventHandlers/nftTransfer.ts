import { NftEntity, NftOperationEntity } from "../types"
import { CommonEventData } from "../helpers"

export const nftOperationEntityHandler = async (
  record: NftEntity,
  oldOwner: string,
  commonEventData: CommonEventData,
  typeOfTransaction: string,
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
      nftOperationRecord.royalty = record.royalty
      break
    case "addNftToCollection":
      nftOperationRecord.collectionId = record.collectionId
      break
  }
  await nftOperationRecord.save()
}
