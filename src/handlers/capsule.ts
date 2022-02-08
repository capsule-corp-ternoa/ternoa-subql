import { getCommonExtrinsicData, insertDataToEntity, updateAccount } from '../helpers'
import { ExtrinsicHandler } from './types'
import { NftEntity } from "../types/models/NftEntity";
import { SerieEntity } from '../types';
import { genericTransferHandler, nftTransferEntityHandler } from '.';
import { Balance } from '@polkadot/types/interfaces';
import { formatString } from '../utils';

export const createCapsuleHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const date = new Date()
  const { extrinsic: _extrinsic, events } = extrinsic
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  const [nftIpfs, capsuleIpfs, _seriesId] = call.args
  if (commonExtrinsicData.isSuccess === 1){
    const nftCreatedEvents = extrinsic.events.filter(x => x.event.section === "nfts" && x.event.method === "Created")
    const methodEventsOriginalIndexes:number[] = []
    const treasuryEventsOriginalIndexes:number[] = []
    const methodEvents = extrinsic.events.filter((x,i) => {
      if (x.event.section === "capsules" && x.event.method === "CapsuleCreated"){
        methodEventsOriginalIndexes.push(i)
        return true
      }
      return false
    })
    const treasuryEventsForNFTsEvents = extrinsic.events.filter((_,i) => {
      if (i < extrinsic.events.length - 1 && extrinsic.events[i+1].event.section === "nfts" && extrinsic.events[i+1].event.method === "Created"){
        treasuryEventsOriginalIndexes.push(i)
        return true
      }
      return false
    })
    const event = methodEvents[call.batchMethodIndex || 0]
    const nftEvent = nftCreatedEvents[call.batchMethodIndex || 0]
    const treasuryEvent = treasuryEventsForNFTsEvents[call.batchMethodIndex || 0]
    if (event && nftEvent){
      const signer = _extrinsic.signer.toString()
      const [_owner, nftId, balance] = event.event.data;
      const [_nftId, __owner, seriesId, _offchain_uri] = nftEvent.event.data;
      logger.info('capsule creation :' + nftId);
      let seriesString = formatString(seriesId.toString())
      let serieRecord = await SerieEntity.get(seriesString)
      if (!serieRecord){
        serieRecord = new SerieEntity(seriesString)
        serieRecord.owner = signer
        serieRecord.locked = true
        serieRecord.createdAt = date
        serieRecord.updatedAt = date
        await serieRecord.save()
      }else{
        if (serieRecord.locked === false){
          serieRecord.locked = true
          serieRecord.updatedAt = date
          await serieRecord.save()
        }
      }
      const record = new NftEntity(nftId.toString())
      insertDataToEntity(record, commonExtrinsicData)
      record.currency = 'CAPS';
      record.listed = 0;
      record.isLocked = true;
      record.owner = signer;
      record.serieId = serieRecord.id;
      record.creator = signer;
      record.nftId = nftId.toString();
      record.nftIpfs = formatString(nftIpfs.toString())
      record.capsuleIpfs = formatString(capsuleIpfs.toString())
      record.isCapsule = true;
      record.frozenCaps = (balance as Balance).toBigInt().toString();
      record.timestampCreate = commonExtrinsicData.timestamp
      record.createdAt = date
      record.updatedAt = date
      await record.save()
      // Record NFT Transfer
      await nftTransferEntityHandler(record, "null address", commonExtrinsicData, "creation")
      // Record Treasury Event for NFTs
      if (treasuryEvent){
        const [amount] = treasuryEvent.event.data
        const extrinsicIndex = treasuryEvent.phase.isApplyExtrinsic ? treasuryEvent.phase.asApplyExtrinsic.toNumber() : 0
        await genericTransferHandler(signer.toString(), 'Treasury', amount, commonExtrinsicData, treasuryEventsOriginalIndexes[call.batchMethodIndex || 0], extrinsicIndex)
      }
      // Record Deposit Event
      const extrinsicIndex = event.phase.isApplyExtrinsic ? event.phase.asApplyExtrinsic.toNumber() : 0
      await genericTransferHandler(signer.toString(), "Capsule deposit", balance, commonExtrinsicData, methodEventsOriginalIndexes[call.batchMethodIndex || 0], extrinsicIndex)
      // Update concerned accounts
      await updateAccount(signer);
    }else{
      logger.error('create capsule error at block:' + commonExtrinsicData.blockId);
      logger.error('create capsule error detail: event not found');
    }
  }else{
    logger.error('create capsule error at block:' + commonExtrinsicData.blockId);
    logger.error('create capsule error detail: isExtrinsicSuccess ' + commonExtrinsicData.isSuccess);
  }
}

export const createFromNftHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const date = new Date()
  const { extrinsic: _extrinsic, events } = extrinsic
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  const [nftId, capsuleIpfs] = call.args
  if (commonExtrinsicData.isSuccess === 1){
    logger.info('conversion to capsule :' + nftId);
    const methodEvents = extrinsic.events.filter(x => x.event.section === "capsules" && x.event.method === "CapsuleCreated")
    const event = methodEvents[call.batchMethodIndex || 0]
    if (event){
      const [owner, _nftId, balance] = event.event.data;
      // retieve the nft
      const record = await NftEntity.get(nftId.toString());
      if (record !== undefined) {
        try {
          const signer = _extrinsic.signer.toString()
          let serieRecord = await SerieEntity.get(record.serieId.toString())
          if (serieRecord && serieRecord.locked){
            serieRecord.locked = true
            serieRecord.updatedAt = date
            await serieRecord.save()
          }
          record.isCapsule = true
          record.isLocked = true
          record.capsuleIpfs = formatString(capsuleIpfs.toString())
          record.frozenCaps = (balance as Balance).toBigInt().toString()
          record.updatedAt = date
          await record.save()
          // Record Deposit Event
          const extrinsicIndex = event.phase.isApplyExtrinsic ? event.phase.asApplyExtrinsic.toNumber() : 0
          await genericTransferHandler(signer.toString(), "Capsule deposit", balance, commonExtrinsicData, call.batchMethodIndex || 0, extrinsicIndex)
      
          // Update concerned accounts
          await updateAccount(signer);
        } catch (e) {
          logger.error('convert nft to capsule error:' + nftId);
          logger.error('convert nft to capsule error detail: ' + e);
        }
      }else{
        logger.error('create capsule from nft error at block:' + commonExtrinsicData.blockId);
        logger.error('create capsule from nft error detail: nft not found in db');
      }
    }else{
      logger.error('create capsule from nft error at block:' + commonExtrinsicData.blockId);
      logger.error('create capsule from nft error detail: event not found');
    }
  }else{
    logger.error('convert nft to capsule error:' + nftId);
    logger.error('convert nft to capsule error detail: isExtrinsicSuccess ' + commonExtrinsicData.isSuccess);
  }
}

export const removeCapsuleHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const date = new Date()
  const { extrinsic: _extrinsic, events } = extrinsic
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  const [nftId] = call.args
  if (commonExtrinsicData.isSuccess === 1){
    logger.info('revert capsule to nft :' + nftId);
    const methodEvents = extrinsic.events.filter(x => x.event.section === "capsules" && x.event.method === "CapsuleRemoved")
    const event = methodEvents[call.batchMethodIndex || 0]
    const [amount] = event.event.data
    // retieve the nft
    const record = await NftEntity.get(nftId.toString());
    if (record !== undefined) {
      try {
        const signer = _extrinsic.signer.toString()
        record.isCapsule = false
        record.isLocked = false
        record.capsuleIpfs = null
        record.frozenCaps = "0"
        record.updatedAt = date
        await record.save()
        // Record Deposit returned Event
        const extrinsicIndex = event?.phase.isApplyExtrinsic ? event.phase.asApplyExtrinsic.toNumber() : 0
        await genericTransferHandler("Capsule deposit returned", signer.toString(), amount, commonExtrinsicData, call.batchMethodIndex || 0, extrinsicIndex)
        // Update concerned accounts
        await updateAccount(signer);
      } catch (e) {
        logger.error('revert capsule to nft error:' + nftId);
        logger.error('revert capsule to nft error detail: ' + e);
      }
    }
  }else{
    logger.error('revert capsule to nft error:' + nftId);
    logger.error('revert capsule to nft error detail: isExtrinsicSuccess ' + commonExtrinsicData.isSuccess);
  }
}

export const addFundsHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const date = new Date()
  const { extrinsic: _extrinsic, events } = extrinsic
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  const [nftId, amount] = call.args
  if (commonExtrinsicData.isSuccess === 1){
    logger.info('add funds to capsule :' + nftId);
    const methodEvents = extrinsic.events.filter(x => x.event.section === "capsules" && x.event.method === "CapsuleFundsAdded")
    const event = methodEvents[call.batchMethodIndex || 0]
    // retieve the nft
    const record = await NftEntity.get(nftId.toString());
    if (record !== undefined) {
      try {
        const signer = _extrinsic.signer.toString()
        record.frozenCaps = (BigInt(record.frozenCaps) + (amount as Balance).toBigInt()).toString()
        record.updatedAt = date
        await record.save()
        // Record Deposit added Event
        const extrinsicIndex = event?.phase.isApplyExtrinsic ? event.phase.asApplyExtrinsic.toNumber() : 0
        await genericTransferHandler(signer.toString(), "Capsule deposit add funds", amount, commonExtrinsicData, call.batchMethodIndex || 0, extrinsicIndex)
        // Update concerned accounts
        await updateAccount(signer);
      } catch (e) {
        logger.error('add funds to capsule error:' + nftId);
        logger.error('add funds to capsule error detail: ' + e);
      }
    }
  }else{
    logger.error('add funds to capsule error:' + nftId);
    logger.error('add funds to capsule error detail: isExtrinsicSuccess ' + commonExtrinsicData.isSuccess);
  }
}

export const setCapsuleIpfsHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const date = new Date()
  const { extrinsic: _extrinsic, events } = extrinsic
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  const [nftId, capsuleIpfs] = call.args
  if (commonExtrinsicData.isSuccess === 1){
    logger.info('set capsule ipfs :' + nftId);
    // retieve the nft
    const record = await NftEntity.get(nftId.toString());
    if (record !== undefined) {
      try {
        const signer = _extrinsic.signer.toString()
        const oldCapsuleIpfs = record.capsuleIpfs
        record.capsuleIpfs = formatString(capsuleIpfs.toString())
        record.updatedAt = date
        await record.save()
        logger.info("capsule ipfs change: " + JSON.stringify(oldCapsuleIpfs) + " --> " + JSON.stringify(record.capsuleIpfs))
        // Update concerned accounts
        await updateAccount(signer);
      } catch (e) {
        logger.error('set capsule ipfs error:' + nftId);
        logger.error('set capsule ipfs error detail: ' + e);
      }
    }
  }else{
    logger.error('set capsule ipfs error:' + nftId);
    logger.error('set capsule ipfs error detail: isExtrinsicSuccess ' + commonExtrinsicData.isSuccess);
  }
}