import { SubstrateExtrinsic } from "@subql/types";
import { checkIfExtrinsicExecuteSuccess } from "../helpers";
import { ExtrinsicEntity } from "../types";

export const genericExtrinsicHandler = async (extrinsic: SubstrateExtrinsic): Promise<void> => {
    try{
        const ext = extrinsic.extrinsic
        const block = extrinsic.block
        const events = extrinsic.events
        const methodData = ext.method
        const blockExtrinsics = block.block.extrinsics
        /* Record Extrinsic data */
        const extrinsicRecord = new ExtrinsicEntity(ext.hash.toHex())
        extrinsicRecord.blockId = block.block.header.hash.toHex()
        extrinsicRecord.blockNumber = block.block.header.number.toNumber()
        extrinsicRecord.extrinsicIndex = blockExtrinsics.findIndex(x => x.hash.toHex() === ext.hash.toHex())
        extrinsicRecord.hash = ext.hash.toHex()
        extrinsicRecord.timestamp = block.timestamp
        extrinsicRecord.module = methodData.section
        extrinsicRecord.call = methodData.method
        extrinsicRecord.description = (ext.meta as any).documentation.map((d) => d.toString()).join('\n')
        extrinsicRecord.signer = ext.signer.toString()
        extrinsicRecord.isSigned = ext.isSigned
        extrinsicRecord.signature = ext.signature.toString()
        extrinsicRecord.nonce = ext.nonce.toNumber()
        extrinsicRecord.success = checkIfExtrinsicExecuteSuccess(extrinsic)
        extrinsicRecord.argsName = methodData.meta.args.map(a => a.name.toString())
        extrinsicRecord.argsValue = methodData.args.map((a) => a.toString())
        extrinsicRecord.nbEvents = events.length
        await extrinsicRecord.save()
    }catch(err){
        logger.error(`record extrinsic error at : hash(${extrinsic.extrinsic.hash}) and block nb ${extrinsic.block.block.header.number.toNumber()}`);
        logger.error('record block error detail:' + err);
        if (err.sql) logger.error('record block error sql detail:' + err.sql);
    }
    
  }