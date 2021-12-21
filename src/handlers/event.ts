import { SubstrateEvent } from "@subql/types"
import { EventDescriptionEntity, EventEntity } from "../types"

export const genericEventHandler = async (event: SubstrateEvent): Promise<void> => {
    try{
        const blockHeader = event.block.block.header
        const blockNumber = blockHeader.number.toNumber()
        const eventData = event.event
        const documentation = eventData.meta.docs ? eventData.meta.docs : JSON.parse(JSON.stringify(eventData.meta)).documentation
        const eventRecord = new EventEntity(`${blockNumber}-${event.idx}`)
        eventRecord.blockId = blockNumber.toString()
        if (event.extrinsic) eventRecord.extrinsicId = `${blockNumber}-${event.extrinsic.idx}`
        eventRecord.eventIndex = event.idx
        eventRecord.module = eventData.section
        eventRecord.call = eventData.method
        eventRecord.argsName = eventData.meta.args.map(a => a.toString())
        eventRecord.argsValue = eventData.data.map(a => JSON.stringify(a).indexOf('u0000') === -1 ? 
            a.toString()
        : 
            JSON.stringify(a).split("u0000").join('')
                .split("\\").join('')
                .split("\"").join('')
        )
        let descriptionRecord = await EventDescriptionEntity.get(`${eventData.section}_${eventData.method}`)
        if (!descriptionRecord){
            descriptionRecord = new EventDescriptionEntity(`${eventData.section}_${eventData.method}`)
            descriptionRecord.module = eventData.section
            descriptionRecord.call = eventData.method
            descriptionRecord.description = JSON.stringify(documentation.map(d => d.toString()).join('\n'))
            await descriptionRecord.save()
            logger.info('new event description recorded')
        }
        eventRecord.descriptionId = descriptionRecord.id
        await eventRecord.save()
    }catch(err){
        logger.error('record event error at block number:' + event.block.block.header.number.toNumber());
        logger.error('record event error detail:' + err);
    }
  }