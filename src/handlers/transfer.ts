import { insertDataToEntity } from "../helpers"
import { TransferEntity } from "../types"
import { Balance } from '@polkadot/types/interfaces';
import { Codec } from "@polkadot/types/types";
import { roundPrice } from "../utils";

export const genericTransferHandler = async (
    from: string, 
    to: string,
    amount: Codec,
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
    currency: string = "CAPS",
    i?: number,
): Promise<void> => {
    try{
        const transferRecord = new TransferEntity(`${commonExtrinsicData.hash}${i >- 1 ? `-${i}` : ""}`)
        insertDataToEntity(transferRecord, commonExtrinsicData)
        transferRecord.from = from
        transferRecord.to = to
        transferRecord.currency = currency
        transferRecord.amount = (amount as Balance).toBigInt().toString();
        transferRecord.amountRounded = roundPrice(transferRecord.amount)
        await transferRecord.save()
    }catch(err){
        logger.error('record transfer error at block number:' + commonExtrinsicData.blockId);
        logger.error('record transfer error detail:' + err);
    }
}