import { getCommonExtrinsicData, insertDataToEntity, updateAccount } from '../helpers'
import { ExtrinsicHandler } from './types'
import { NftEntity } from "../types/models/NftEntity";
import { SerieEntity } from '../types';
import { nftTransferEntityHandler, treasuryEventHandler } from '.';
import { Balance } from '@polkadot/types/interfaces';
import { hexToString, isHex } from '../utils';

export const createCapsuleHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const { extrinsic: _extrinsic, events } = extrinsic
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  const [nftIpfs, capsuleIpfs, seriesId] = call.args
  if (commonExtrinsicData.isSuccess === 1){
    const methodEvents = extrinsic.events.filter(x => x.event.section === "capsules" && x.event.method === "CapsuleCreated")
    const treasuryEventsForMethodEvents = extrinsic.events.filter((_,i) => 
      (i < extrinsic.events.length - 1 ) && 
      extrinsic.events[i+1].event.section === "nfts" &&
      extrinsic.events[i+1].event.method === "Created"
    )
    const event = methodEvents[call.batchMethodIndex || 0]
    if (event){
      const signer = _extrinsic.signer.toString()
      const [owner, nftId, balance] = event.event.data;
      logger.info('capsule creation :' + nftId);
      let serieRecord = await SerieEntity.get(seriesId.toString())
      if (!serieRecord){
        serieRecord = new SerieEntity(seriesId.toString())
        serieRecord.owner = signer
        serieRecord.locked = true
        await serieRecord.save()
      }else{
        if (serieRecord.locked === false){
          serieRecord.locked = true
          await serieRecord.save()
        }
      }
      const record = new NftEntity(nftId.toString())
      insertDataToEntity(record, commonExtrinsicData)
      record.currency = 'CAPS';
      record.listed = 0;
      record.owner = signer;
      record.serieId = serieRecord.id;
      record.creator = signer;
      record.nftId = nftId.toString();
      record.nftIpfs = isHex(nftIpfs.toString()) ? hexToString(nftIpfs.toString()) : nftIpfs.toString()
      record.capsuleIpfs = isHex(capsuleIpfs.toString()) ? hexToString(capsuleIpfs.toString()) : capsuleIpfs.toString()
      record.isCapsule = true;
      record.frozenCaps = (balance as Balance).toBigInt().toString();
      await record.save()
      // Record NFT Transfer
      await nftTransferEntityHandler(record, "null address", commonExtrinsicData, "creation")
      // Record Treasury Event
      if (treasuryEventsForMethodEvents[call.batchMethodIndex || 0]){
        await treasuryEventHandler(treasuryEventsForMethodEvents[call.batchMethodIndex || 0], signer, commonExtrinsicData)
      }
      // Update concerned accounts
      await updateAccount(signer, call, extrinsic);
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
          let serieRecord = await SerieEntity.get(record.serieId.toString())
          if (serieRecord && serieRecord.locked){
            serieRecord.locked = true
            await serieRecord.save()
          }
          record.isCapsule = true
          record.capsuleIpfs = isHex(capsuleIpfs.toString()) ? hexToString(capsuleIpfs.toString()) : capsuleIpfs.toString()
          record.frozenCaps = (balance as Balance).toBigInt().toString()
          await record.save()
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
  const { extrinsic: _extrinsic, events } = extrinsic
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  const [nftId] = call.args
  if (commonExtrinsicData.isSuccess === 1){
    logger.info('revert capsule to nft :' + nftId);
    // retieve the nft
    const record = await NftEntity.get(nftId.toString());
    if (record !== undefined) {
      try {
        record.isCapsule = false
        record.capsuleIpfs = null
        record.frozenCaps = "0"
        await record.save()
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
  const { extrinsic: _extrinsic, events } = extrinsic
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  const [nftId, amount] = call.args
  if (commonExtrinsicData.isSuccess === 1){
    logger.info('add funds to capsule :' + nftId);
    // retieve the nft
    const record = await NftEntity.get(nftId.toString());
    if (record !== undefined) {
      try {
        record.frozenCaps = (BigInt(record.frozenCaps) + (amount as Balance).toBigInt()).toString()
        await record.save()
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
  const { extrinsic: _extrinsic, events } = extrinsic
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  const [nftId, capsuleIpfs] = call.args
  if (commonExtrinsicData.isSuccess === 1){
    logger.info('set capsule ipfs :' + nftId);
    // retieve the nft
    const record = await NftEntity.get(nftId.toString());
    if (record !== undefined) {
      try {
        const oldCapsuleIpfs = record.capsuleIpfs
        const formattedCapsuleIpfs = capsuleIpfs.toString()
        record.capsuleIpfs = formattedCapsuleIpfs
        await record.save()
        logger.info("capsule ipfs change: " + JSON.stringify(oldCapsuleIpfs) + " --> " + JSON.stringify(record.capsuleIpfs))
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