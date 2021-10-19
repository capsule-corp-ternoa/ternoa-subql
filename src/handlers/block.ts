import { SubstrateBlock } from "@subql/types";
import { BlockEntity } from "../types";

export const blockHandler = async (block: SubstrateBlock): Promise<void> => {
    try{
        const blockHeader = block.block.header
        const blockExtrinsics = block.block.extrinsics
        const blockRecord = new BlockEntity(block.block.header.hash.toHex())
        blockRecord.number = blockHeader.number.toNumber()
        blockRecord.hash = blockHeader.hash.toHex()
        blockRecord.timestamp = block.timestamp
        blockRecord.parentHash = blockHeader.parentHash.toHex()
        blockRecord.stateRoot = blockHeader.stateRoot.toHex()
        blockRecord.extrinsicsRoot = blockHeader.extrinsicsRoot.toHex()
        blockRecord.nbExtrinsics = blockExtrinsics.length
        blockRecord.runtimeVersion = block.specVersion
        await blockRecord.save()
    }catch(err){
        logger.error('record block error:' + block.block.header.number.toNumber());
        logger.error('record block error detail:' + err);
    }
  }