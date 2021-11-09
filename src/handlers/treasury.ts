import { SubstrateEvent } from "@subql/types"
import { insertDataToEntity } from "../helpers"
import { TransferEntity } from "../types"
import { Balance } from '@polkadot/types/interfaces';
import { EventRecord } from '@polkadot/types/interfaces'

export const treasuryEventHandler = async (
    event: EventRecord, 
    signer: string,
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
    }
): Promise<void> => {
    try{
        const transferRecord = new TransferEntity(commonExtrinsicData.hash)
        const [amount] = event.event.data
        insertDataToEntity(transferRecord, commonExtrinsicData)
        transferRecord.from = signer
        transferRecord.to = 'Treasury'
        transferRecord.currency = 'CAPS'
        transferRecord.amount = (amount as Balance).toBigInt().toString();
        await transferRecord.save()
    }catch(err){
        logger.error('record treasury transfer error at block number:' + commonExtrinsicData.blockId);
        logger.error('record treasury transfer error detail:' + err);
    }
  }