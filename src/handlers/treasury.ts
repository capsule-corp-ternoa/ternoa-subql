import { SubstrateEvent } from "@subql/types"
import { getCommonExtrinsicData, insertDataToEntity, mapExtrinsic } from "../helpers"
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

/*export const genericTreasuryEventHandler = async (event: SubstrateEvent): Promise<void> => {
    try{
        const extrinsic = event.extrinsic
        const { section, method, args } = extrinsic.extrinsic.method
        const call = { section, method, args }
        const commonExtrinsicData = getCommonExtrinsicData(call, mapExtrinsic(extrinsic))
        const transferRecord = new TransferEntity(commonExtrinsicData.hash)
        const [amount] = event.event.data
        insertDataToEntity(transferRecord, commonExtrinsicData)
        transferRecord.from = extrinsic.extrinsic.signer.toString()
        transferRecord.to = 'Treasury'
        transferRecord.currency = 'CAPS'
        transferRecord.amount = (amount as Balance).toBigInt().toString();
        await transferRecord.save()
    }catch(err){
        logger.error('record treasury transfer error at block number:' + event.block.block.header.number.toString());
        logger.error('record treasury transfer error detail:' + err);
    }
}*/