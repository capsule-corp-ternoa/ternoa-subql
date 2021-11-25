import { SubstrateExtrinsic } from "@subql/types";
import { checkIfExtrinsicExecuteSuccess } from "../helpers";
import { ExtrinsicDescriptionEntity, ExtrinsicEntity } from "../types";

export const genericExtrinsicHandler = async (extrinsic: SubstrateExtrinsic): Promise<void> => {
    try{
        const ext = extrinsic.extrinsic
        const block = extrinsic.block
        const methodData = ext.method
        const documentation = ext.meta.docs ? ext.meta.docs : JSON.parse(JSON.stringify(ext.meta)).documentation
        /* Record Extrinsic data */
        const extrinsicRecord = new ExtrinsicEntity(`${block.block.header.number.toString()}-${extrinsic.idx}`)
        extrinsicRecord.blockId = block.block.header.number.toString()
        extrinsicRecord.extrinsicIndex = extrinsic.idx
        extrinsicRecord.hash = ext.hash.toString()
        extrinsicRecord.timestamp = block.timestamp
        extrinsicRecord.module = methodData.section
        extrinsicRecord.call = methodData.method
        extrinsicRecord.signer = ext.signer.toString()
        extrinsicRecord.isSigned = ext.isSigned
        extrinsicRecord.signature = ext.signature.toString()
        extrinsicRecord.nonce = ext.nonce.toNumber()
        extrinsicRecord.success = checkIfExtrinsicExecuteSuccess(extrinsic)
        extrinsicRecord.argsName = methodData.meta.args.map(a => a.name.toString())
        extrinsicRecord.argsValue = methodData.args.map((a) => a.toString())
        extrinsicRecord.nbEvents = extrinsic.events.length
        extrinsicRecord.fees = await getFees(ext.toHex(), block.block.header.hash.toHex())
        let descriptionRecord = await ExtrinsicDescriptionEntity.get(`${methodData.section}_${methodData.method}`)
        if (!descriptionRecord){
            descriptionRecord = new ExtrinsicDescriptionEntity(`${methodData.section}_${methodData.method}`)
            descriptionRecord.module = methodData.section
            descriptionRecord.call = methodData.method
            descriptionRecord.description = JSON.stringify(documentation.map(d => d.toString()).join('\n'))
            await descriptionRecord.save()
            logger.info('new extrinsic description recorded')
        }
        extrinsicRecord.descriptionId = descriptionRecord.id
        await extrinsicRecord.save()
    }catch(err){
        logger.error(`record extrinsic error at : hash(${extrinsic.extrinsic.hash}) and block nb ${extrinsic.block.block.header.number.toNumber()}`);
        logger.error('record extrinsic error detail:' + err);
        if (err.sql) logger.error('record extrinsic error sql detail:' + err.sql);
    }
}

export const getFees = async (extObjectHash: string, blockHash: string) => {
    try{
        let fees = await api.rpc.payment.queryFeeDetails(extObjectHash, blockHash)
        if (fees){
            const feesFormatted = JSON.parse(JSON.stringify(fees))
            const inclusionFee = feesFormatted.inclusionFee
            const baseFee = inclusionFee.baseFee
            const lenFee = inclusionFee.lenFee
            const adjustedWeightFee = inclusionFee.adjustedWeightFee
            if (inclusionFee){
                let totalFees = BigInt(0)
                if(baseFee) totalFees = totalFees + BigInt(baseFee); else logger.info("undefined 1")
                if(lenFee) totalFees = totalFees + BigInt(lenFee); else logger.info("undefined 2")
                if(adjustedWeightFee) totalFees = totalFees + BigInt(adjustedWeightFee); else logger.info("undefined 3")
                logger.info(totalFees.toString())
                return totalFees.toString()
            }
        }
        return ""
    }catch(err){
        logger.error(`get extrinsic fee error`);
        logger.error('get extrinsic fee error detail:' + err);
    }
}