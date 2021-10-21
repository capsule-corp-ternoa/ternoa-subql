import { SubstrateBlock } from "@subql/types";
import { BlockEntity } from "../types";

export const blockHandler = async (block: SubstrateBlock): Promise<void> => {
    try{
        const blockHeader = block.block.header
        const blockExtrinsics = block.block.extrinsics
        const blockRecord = new BlockEntity(blockHeader.number.toString())
        blockRecord.number = blockHeader.number.toNumber()
        blockRecord.hash = blockHeader.hash.toString()
        blockRecord.timestamp = block.timestamp
        blockRecord.parentHash = blockHeader.parentHash.toString()
        blockRecord.stateRoot = blockHeader.stateRoot.toString()
        blockRecord.extrinsicsRoot = blockHeader.extrinsicsRoot.toString()
        blockRecord.nbExtrinsics = blockExtrinsics.length
        blockRecord.runtimeVersion = block.specVersion
        blockRecord.sessionId = (await api.query.session.currentIndex()).toNumber()
        await blockRecord.save()
    }catch(err){
        logger.error('record block error:' + block.block.header.number.toNumber());
        logger.error('record block error detail:' + err);
    }
  }