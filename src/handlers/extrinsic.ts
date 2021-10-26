import { SubstrateExtrinsic } from "@subql/types";
import { checkIfExtrinsicExecuteSuccess } from "../helpers";
import { EventEntity, ExtrinsicEntity } from "../types";

export const genericExtrinsicHandler = async (extrinsic: SubstrateExtrinsic): Promise<void> => {
    try{
        const ext = extrinsic.extrinsic
        const block = extrinsic.block
        const methodData = ext.method
        /* Record Extrinsic data */
        const extrinsicRecord = new ExtrinsicEntity(`${block.block.header.number.toString()}-${extrinsic.idx}`)
        extrinsicRecord.blockId = block.block.header.number.toString()
        extrinsicRecord.extrinsicIndex = extrinsic.idx
        extrinsicRecord.hash = ext.hash.toString()
        extrinsicRecord.timestamp = block.timestamp
        extrinsicRecord.module = methodData.section
        extrinsicRecord.call = methodData.method
        extrinsicRecord.description = JSON.parse(JSON.stringify(ext.meta)).documentation.map(d => d.toString()).join('\n')
        extrinsicRecord.signer = ext.signer.toString()
        extrinsicRecord.isSigned = ext.isSigned
        extrinsicRecord.signature = ext.signature.toString()
        extrinsicRecord.nonce = ext.nonce.toNumber()
        extrinsicRecord.success = checkIfExtrinsicExecuteSuccess(extrinsic)
        extrinsicRecord.argsName = methodData.meta.args.map(a => a.name.toString())
        extrinsicRecord.argsValue = methodData.args.map((a) => a.toString())
        extrinsicRecord.nbEvents = extrinsic.events.length
        await extrinsicRecord.save()
    }catch(err){
        logger.error(`record extrinsic error at : hash(${extrinsic.extrinsic.hash}) and block nb ${extrinsic.block.block.header.number.toNumber()}`);
        logger.error('record extrinsic error detail:' + err);
        if (err.sql) logger.error('record extrinsic error sql detail:' + err.sql);
    }
    
  }