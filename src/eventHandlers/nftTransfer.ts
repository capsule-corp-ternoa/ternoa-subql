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
    case "setRoyalty":
      nftOperationRecord.royalty = record.royalty
      break
    case "sell":
      nftOperationRecord.to = record.owner
      nftOperationRecord.marketplaceId = args[0]
      nftOperationRecord.price = args[1]
      nftOperationRecord.priceRounded = roundPrice(nftOperationRecord.price)
      nftOperationRecord.marketplaceCut = args[2]
      nftOperationRecord.marketplaceCutRounded = roundPrice(nftOperationRecord.marketplaceCut)
      nftOperationRecord.royaltyCut = args[3]
      nftOperationRecord.royaltyCutRounded = roundPrice(nftOperationRecord.royaltyCut)
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
    case "unlist":
      break
    case "rentalContractCreated":
      nftOperationRecord.rentalContractDurationType = args[0]
      break
    case "rentalContractStarted":
      nftOperationRecord.to = record.rentee
      nftOperationRecord.rentalContractStartBlock = args[0]
      nftOperationRecord.rentalContractDurationType = args[1]
      nftOperationRecord.rentalContractBlockDuration = args[2]
      nftOperationRecord.rentalContractBlockSubscriptionRenewal = args[3]
      nftOperationRecord.rentalContractFeeType = args[4]
      nftOperationRecord.rentalContractFee = args[5]
      nftOperationRecord.rentalContractFeeRounded = args[6]
      break
    case "rentalContractRevoked":
    case "rentalContractEnded":
    case "rentalContractExpired":
      break
  }
  await nftOperationRecord.save()
}
