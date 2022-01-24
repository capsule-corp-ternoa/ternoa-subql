import { NftEntity, NftTransferEntity } from "../types";
import { roundPrice } from "../utils";

export const nftTransferEntityHandler = async (
    record: NftEntity, 
    oldOwner: string, 
    commonExtrinsicData: {
        hash: string;
        blockId: string;
        blockHash: string;
        extrinsicId: string;
        timestamp: Date;
        isSuccess: number;
        isBatch: number;
        isSudo: number;
        batchIndex: number;
    }, 
    typeOfTransaction: string,
    amount="0",
    marketplaceId: string=null,
): Promise<void> => {
    try{
        /* Record nft transfer data */
        const nftTransferRecord = new NftTransferEntity(commonExtrinsicData.hash + "-" + record.nftId)
        nftTransferRecord.blockId = commonExtrinsicData.blockId
        nftTransferRecord.extrinsicId = commonExtrinsicData.extrinsicId
        nftTransferRecord.nftId = record.id
        nftTransferRecord.seriesId = record.serieId
        nftTransferRecord.from = oldOwner
        nftTransferRecord.to = typeOfTransaction !== "burn" ? record.owner : "null address"
        nftTransferRecord.timestamp = commonExtrinsicData.timestamp
        nftTransferRecord.typeOfTransaction = typeOfTransaction
        nftTransferRecord.amount = amount
        nftTransferRecord.amountRounded = roundPrice(nftTransferRecord.amount)
        if (typeOfTransaction === "sale" && marketplaceId) nftTransferRecord.marketplaceId = marketplaceId
        await nftTransferRecord.save()
    }catch(err){
        logger.error('record nft transfer error:' + commonExtrinsicData.hash);
        logger.error('record nft transfer error detail:' + err);
    }
  }