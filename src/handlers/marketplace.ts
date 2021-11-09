import { getCommonExtrinsicData, hexToString, updateAccount } from '../helpers'
import { ExtrinsicHandler } from './types'
import { MarketplaceEntity } from '../types';
import { treasuryEventHandler } from '.';

export const createMarketplaceHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const { extrinsic: _extrinsic, events } = extrinsic
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  const [kind, commissionFee, name] = call.args
  const signer = extrinsic.extrinsic.signer.toString()
  if (commonExtrinsicData.isSuccess === 1){
    const eventIndex = events.findIndex(x => 
        x.event.section === "marketplace" && 
        x.event.method === "MarketplaceCreated" && 
        x.event.data &&
        JSON.parse(JSON.stringify(x.event.data))[1] === signer
    )
    if (eventIndex !== -1){
        const event = extrinsic.events[eventIndex]
        const [id, owner] = event.event.data
        try {
            const record = new MarketplaceEntity(id.toString())
            record.kind = kind.toString()
            record.name = hexToString(name.toString())
            record.commissionFee = commissionFee.toString()
            record.owner = owner.toString()
            await record.save()
            logger.info("new marketplace details: " + JSON.stringify(record))
            // Record Treasury Event
            const treasuryEvent = eventIndex > 0 ? extrinsic.events[eventIndex-1] : null
            if (treasuryEvent){
              await treasuryEventHandler(treasuryEvent, signer, commonExtrinsicData)
              await updateAccount(signer, call, extrinsic);
            }
        } catch (e) {
            logger.error('create marketplace error at block: ' + commonExtrinsicData.blockId);
            logger.error('create marketplace error detail: ' + e);
        }
    }
  }else{
    logger.error('create marketplace error at block: ' + commonExtrinsicData.blockId);
    logger.error('create marketplace error detail: isExtrinsicSuccess ' + commonExtrinsicData.isSuccess);
  }
}

export const updateMarketplaceNameHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const { extrinsic: _extrinsic, events } = extrinsic
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  const [id, name] = call.args
  if (commonExtrinsicData.isSuccess === 1){
    try {
        const record = await MarketplaceEntity.get(id.toString())
        const oldName = record.name
        record.name = hexToString(name.toString())
        await record.save()
        logger.info("marketplace rename: " + JSON.stringify(oldName) + " --> " + JSON.stringify(record.name))
    } catch (e) {
        logger.error('marketplace rename error at block: ' + commonExtrinsicData.blockId);
        logger.error('marketplace rename error detail: ' + e);
    }
  }else{
    logger.error('marketplace rename error at block: ' + commonExtrinsicData.blockId);
    logger.error('marketplace rename error detail: isExtrinsicSuccess ' + commonExtrinsicData.isSuccess);
  }
}

export const updateMarketplaceKindHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const { extrinsic: _extrinsic, events } = extrinsic
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  const [id, kind] = call.args
  if (commonExtrinsicData.isSuccess === 1){
    try {
        const record = await MarketplaceEntity.get(id.toString())
        const oldKind = record.kind
        record.kind = kind.toString()
        await record.save()
        logger.info("marketplace change kind: " + JSON.stringify(oldKind) + " --> " + JSON.stringify(record.kind))
    } catch (e) {
        logger.error('marketplace change kind error at block: ' + commonExtrinsicData.blockId);
        logger.error('marketplace change kind error detail: ' + e);
    }
  }else{
    logger.error('marketplace change kind error at block: ' + commonExtrinsicData.blockId);
    logger.error('marketplace change kind error detail: isExtrinsicSuccess ' + commonExtrinsicData.isSuccess);
  }
}

export const updateMarketplaceOwnerHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const { extrinsic: _extrinsic, events } = extrinsic
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  const [id, accountId] = call.args
  if (commonExtrinsicData.isSuccess === 1){
    try {
        const record = await MarketplaceEntity.get(id.toString())
        const oldOwner = record.owner
        record.owner = accountId.toString()
        await record.save()
        logger.info("marketplace change owner: " + JSON.stringify(oldOwner) + " --> " + JSON.stringify(record.owner))
    } catch (e) {
        logger.error('marketplace change owner error at block: ' + commonExtrinsicData.blockId);
        logger.error('marketplace change owner error detail: ' + e);
    }
  }else{
    logger.error('marketplace change owner error at block: ' + commonExtrinsicData.blockId);
    logger.error('marketplace change owner error detail: isExtrinsicSuccess ' + commonExtrinsicData.isSuccess);
  }
}
