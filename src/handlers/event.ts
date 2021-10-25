import { SubstrateEvent } from "@subql/types"
import { EventEntity } from "../types"

export const genericEventHandler = async (event: SubstrateEvent): Promise<void> => {
    try{
        const blockHeader = event.block.block.header
        const blockNumber = blockHeader.number.toNumber()
        const eventData = event.event
        const eventRecord = new EventEntity(`${blockNumber}-${event.idx}`)
        eventRecord.blockId = blockNumber.toString()
        if (event.extrinsic) eventRecord.extrinsicId = `${blockNumber}-${event.extrinsic.idx}`
        eventRecord.eventIndex = event.idx
        eventRecord.module = eventData.section
        eventRecord.call = eventData.method
        eventRecord.description = (eventData.meta as any).documentation.map((d) => d.toString()).join('\n')
        eventRecord.argsName = eventData.meta.args.map(a => a.toString())
        eventRecord.argsValue = eventData.data.map(a => a.toString())
        await eventRecord.save()
    }catch(err){
        logger.error('record event error at block number:' + event.block.block.header.number.toNumber());
        logger.error('record event error detail:' + err);
    }
  }