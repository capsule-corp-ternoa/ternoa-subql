import { SubstrateExtrinsic } from "@subql/types"
import { EventEntity } from "../types"

export const genericEventHandler = async (extrinsic: SubstrateExtrinsic): Promise<void> => {
    try{
        for (const [i, _event] of extrinsic.events.entries()){
            const blockHeader = extrinsic.block.block.header
            const extrinsicData = extrinsic.extrinsic
            const event = _event.event
            const blockNumber = blockHeader.number.toNumber()
            const extrinsicIndex = extrinsic.block.block.extrinsics.findIndex(x => x.hash.toString() === extrinsicData.hash.toString())
            const eventRecord = new EventEntity(`${blockNumber}-${extrinsicIndex}-${i}`)
            eventRecord.blockId = blockNumber.toString()
            eventRecord.extrinsicId = `${blockNumber}-${extrinsicIndex}`
            eventRecord.eventIndex = i
            eventRecord.module = event.section
            eventRecord.call = event.method
            eventRecord.description = (event.meta as any).documentation.map((d) => d.toString()).join('\n')
            eventRecord.argsName = event.meta.args.map(a => a.toString())
            eventRecord.argsValue = event.data.map(a => a.toString())
            await eventRecord.save()
        }
        // extrinsic.events.forEach(async (_event, i) => {
           
        // })
    }catch(err){
        logger.error('record event error:' + extrinsic.block.block.header.number.toNumber());
        logger.error('record event error detail:' + err);
    }
  }