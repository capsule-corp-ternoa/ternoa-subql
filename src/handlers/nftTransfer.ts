import { NftEntity, NftTransferEntity } from "../types";

export const nftTransferEntityHandler = async (
    record: NftEntity, 
    oldOwner: string, 
    commonExtrinsicData: {
        hash: string;
        blockId: string;
        blockHash: string;
        extrinsicId: string;
        eventId: string;
        timestamp: Date;
        isSuccess: number;
        isBatch: number;
        isSudo: number;
        batchIndex: number;
    }, 
    isSale=false,
    amount="0",
): Promise<void> => {
    try{
        /* Record nft transfer data */
        const nftTransferRecord = new NftTransferEntity(commonExtrinsicData.hash)
        nftTransferRecord.blockId = commonExtrinsicData.blockId
        nftTransferRecord.extrinsicId = commonExtrinsicData.extrinsicId
        nftTransferRecord.eventId = commonExtrinsicData.eventId
        nftTransferRecord.sender = oldOwner
        nftTransferRecord.receiver = record.owner
        nftTransferRecord.timestamp = commonExtrinsicData.timestamp
        nftTransferRecord.nftId = record.id
        nftTransferRecord.nftUri = record.uri
        nftTransferRecord.nftCreator = record.creator
        nftTransferRecord.typeOfTransaction = isSale ? "sale" : "transfer"
        nftTransferRecord.amount = amount
        await nftTransferRecord.save()
    }catch(err){
        logger.error('record nft transfer error:' + commonExtrinsicData.hash);
        logger.error('record nft transfer error detail:' + err);
    }
  }