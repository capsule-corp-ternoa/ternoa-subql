import { NftEntity, NftTransferEntity } from "../types";
import { CommonEventData, roundPrice } from "../helpers";

export const nftTransferEntityHandler = async (
    record: NftEntity, 
    oldOwner: string, 
    commonEventData: CommonEventData,
    typeOfTransaction: string,
    amount="0",
    marketplaceId: string=null,
): Promise<void> => {
    const nftTransferRecord = new NftTransferEntity(commonEventData.blockHash + "-" + record.nftId)
    nftTransferRecord.blockId = commonEventData.blockId
    nftTransferRecord.extrinsicId = commonEventData.extrinsicId 
    nftTransferRecord.nftId = record.id
    nftTransferRecord.seriesId = record.serieId
    nftTransferRecord.from = oldOwner
    nftTransferRecord.to = typeOfTransaction !== "burn" ? record.owner : "null address"
    nftTransferRecord.timestamp = commonEventData.timestamp
    nftTransferRecord.typeOfTransaction = typeOfTransaction
    nftTransferRecord.amount = amount
    nftTransferRecord.amountRounded = roundPrice(nftTransferRecord.amount)
    if (typeOfTransaction === "sale" && marketplaceId) nftTransferRecord.marketplaceId = marketplaceId
    await nftTransferRecord.save()
  }