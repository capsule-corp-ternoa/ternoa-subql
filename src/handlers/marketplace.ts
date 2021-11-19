import { getCommonExtrinsicData, updateAccount } from '../helpers'
import { ExtrinsicHandler } from './types'
import { MarketplaceEntity } from '../types';
import { treasuryEventHandler } from '.';
import { hexToString, isHex } from '../utils';

export const createMarketplaceHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const { extrinsic: _extrinsic, events } = extrinsic
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  if (commonExtrinsicData.isSuccess === 1){
    const methodEvents = extrinsic.events.filter(x => x.event.section === "marketplace" && x.event.method === "MarketplaceCreated")
    const treasuryEventsForMethodEvents = extrinsic.events.filter((_,i) => 
      (i < extrinsic.events.length - 1 ) && 
      extrinsic.events[i+1].event.section === "marketplace" &&
      extrinsic.events[i+1].event.method === "MarketplaceCreated"
    )
    const event = methodEvents[call.batchMethodIndex || 0]
    if (event){
      const [kind, commissionFee, name, uri, logoUri] = call.args
      const [id, owner] = event.event.data
      const signer = extrinsic.extrinsic.signer.toString()
      try {
        const record = new MarketplaceEntity(id.toString())
        record.kind = kind.toString()
        record.name = isHex(name) ? hexToString(name) : name.toString()
        record.commissionFee = commissionFee.toString()
        record.owner = owner.toString()
        if (uri) record.uri = isHex(uri) ? hexToString(uri) : uri.toString()
        if (logoUri) record.logoUri = isHex(logoUri) ? hexToString(logoUri) : logoUri.toString()
        await record.save()
        logger.info("new marketplace details: " + JSON.stringify(record))
        // Record Treasury Event
        const treasuryEvent = treasuryEventsForMethodEvents[call.batchMethodIndex || 0]
        if (treasuryEvent){
          await treasuryEventHandler(treasuryEvent, signer, commonExtrinsicData)
        }
        // Update concerned accounts
        await updateAccount(signer, call, extrinsic);
      }catch(e){
        logger.error('create marketplace error at block: ' + commonExtrinsicData.blockId);
        logger.error('create marketplace error detail: ' + e);
      }
    }else{
      logger.error('create marketplace error at block: ' + commonExtrinsicData.blockId);
      logger.error('create marketplace error: Created event not found')
    }
  }else{
    logger.error('create marketplace error at block: ' + commonExtrinsicData.blockId);
    logger.error('create marketplace error detail: isExtrinsicSuccess ' + commonExtrinsicData.isSuccess);
  }
}

export const setMarketplaceNameHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const { extrinsic: _extrinsic, events } = extrinsic
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  const [id, name] = call.args
  if (commonExtrinsicData.isSuccess === 1){
    try {
        const record = await MarketplaceEntity.get(id.toString())
        const oldName = record.name
        record.name = name.toString();
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

export const setMarketplaceTypeHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
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

export const setMarketplaceOwnerHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
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

export const setMarketplaceCommissionFeeHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const { extrinsic: _extrinsic, events } = extrinsic
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  const [id, commissionFee] = call.args
  if (commonExtrinsicData.isSuccess === 1){
    try {
        const record = await MarketplaceEntity.get(id.toString())
        const oldCommissionFee = record.commissionFee
        record.commissionFee = commissionFee.toString()
        await record.save()
        logger.info("marketplace change commissionFee: " + JSON.stringify(oldCommissionFee) + " --> " + JSON.stringify(record.commissionFee))
    } catch (e) {
        logger.error('marketplace change commissionFee error at block: ' + commonExtrinsicData.blockId);
        logger.error('marketplace change commissionFee error detail: ' + e);
    }
  }else{
    logger.error('marketplace change commissionFee error at block: ' + commonExtrinsicData.blockId);
    logger.error('marketplace change commissionFee error detail: isExtrinsicSuccess ' + commonExtrinsicData.isSuccess);
  }
}

export const setMarketplaceUriHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const { extrinsic: _extrinsic, events } = extrinsic
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  const [id, uri] = call.args
  if (commonExtrinsicData.isSuccess === 1){
    try {
        const record = await MarketplaceEntity.get(id.toString())
        const oldUri = record.uri
        record.uri = uri.toString()
        await record.save()
        logger.info("marketplace change uri: " + JSON.stringify(oldUri) + " --> " + JSON.stringify(record.uri))
    } catch (e) {
        logger.error('marketplace change uri error at block: ' + commonExtrinsicData.blockId);
        logger.error('marketplace change uri error detail: ' + e);
    }
  }else{
    logger.error('marketplace change uri error at block: ' + commonExtrinsicData.blockId);
    logger.error('marketplace change uri error detail: isExtrinsicSuccess ' + commonExtrinsicData.isSuccess);
  }
}

export const setMarketplaceLogoUriHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const { extrinsic: _extrinsic, events } = extrinsic
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  const [id, uri] = call.args
  if (commonExtrinsicData.isSuccess === 1){
    try {
        const record = await MarketplaceEntity.get(id.toString())
        const oldLogoUri = record.logoUri
        record.logoUri = uri.toString()
        await record.save()
        logger.info("marketplace change logo uri: " + JSON.stringify(oldLogoUri) + " --> " + JSON.stringify(record.logoUri))
    } catch (e) {
        logger.error('marketplace change logo uri error at block: ' + commonExtrinsicData.blockId);
        logger.error('marketplace change logo uri error detail: ' + e);
    }
  }else{
    logger.error('marketplace change logo uri error at block: ' + commonExtrinsicData.blockId);
    logger.error('marketplace change logo uri error detail: isExtrinsicSuccess ' + commonExtrinsicData.isSuccess);
  }
}