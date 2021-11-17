import { getCommonExtrinsicData, insertDataToEntity, updateAccount } from '../helpers'
import { ExtrinsicHandler } from './types'
import { NftEntity } from "../types/models/NftEntity";
import { SerieEntity } from '../types';
import { nftTransferEntityHandler, treasuryEventHandler } from '.';
import { Balance } from '@polkadot/types/interfaces';

export const createCapsuleHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const { extrinsic: _extrinsic, events } = extrinsic
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  const [nftIpfs, capsuleIpfs, seriesId] = call.args
  if (commonExtrinsicData.isSuccess === 1){
    const record = new NftEntity(commonExtrinsicData.hash)
    insertDataToEntity(record, commonExtrinsicData)
    const signer = _extrinsic.signer.toString()
    const eventIndex = extrinsic.events.findIndex(x => 
      x.event.section === "capsules" && 
      x.event.method === "CapsuleCreated" && 
      x.event.data
    )
    if (eventIndex !== -1){
      const event = extrinsic.events[eventIndex]
      if (event && event.event && event.event.data){
        const [owner, nftId, balance] = event.event.data;
        logger.info('capsule creation :' + nftId);
        const formattedNftIpfs = nftIpfs.toString()
        const formattedCapsuleIpfs = capsuleIpfs.toString()
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
        record.currency = 'CAPS';
        record.listed = 0;
        record.owner = signer;
        record.serieId = serieRecord.id;
        record.creator = signer;
        record.id = nftId.toString();
        record.nftId = nftId.toString();
        record.nftIpfs = formattedNftIpfs
        record.capsuleIpfs = formattedCapsuleIpfs
        record.isCapsule = true;
        record.frozenCaps = (balance as Balance).toBigInt().toString();
        await record.save()
        // Record NFT Transfer
        await nftTransferEntityHandler(record, "null address", commonExtrinsicData, "creation")
        // Record Treasury Event
        const treasuryEvent = eventIndex > 0 ? extrinsic.events[eventIndex-1] : null
        if (treasuryEvent){
          await treasuryEventHandler(treasuryEvent, signer, commonExtrinsicData)
        }
        await updateAccount(signer, call, extrinsic);
      }
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
    const eventIndex = extrinsic.events.findIndex(x => 
      x.event.section === "capsules" && 
      x.event.method === "CapsuleCreated" && 
      x.event.data
    )
    if (eventIndex !== -1){
      const event = extrinsic.events[eventIndex]
      if (event && event.event && event.event.data){
        const [owner, _nftId, balance] = event.event.data;
        // retieve the nft
        const record = await NftEntity.get(nftId.toString());
        if (record !== undefined) {
          try {
            const formattedCapsuleIpfs = capsuleIpfs.toString()
            record.isCapsule = true
            record.capsuleIpfs = formattedCapsuleIpfs
            record.frozenCaps = (balance as Balance).toBigInt().toString()
            await record.save()
          } catch (e) {
            logger.error('convert nft to capsule error:' + nftId);
            logger.error('convert nft to capsule error detail: ' + e);
          }
        }
      }
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