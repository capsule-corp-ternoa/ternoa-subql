import { insertDataToEntity, getCommonExtrinsicData, updateAccount } from '../helpers'
import { ExtrinsicHandler } from './types'
import { bnToBn } from '@polkadot/util/bn';
import { NftEntity } from "../types/models/NftEntity";
import { nftTransferEntityHandler } from './nftTransfer';
import { SerieEntity } from '../types';
import { Balance } from '@polkadot/types/interfaces';
import { treasuryEventHandler } from '.';
import { hexToString, isHex } from '../utils';

export const createHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const { extrinsic: _extrinsic } = extrinsic
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  if (commonExtrinsicData.isSuccess === 1){
    const methodEvents = extrinsic.events.filter(x => x.event.section === "nfts" && x.event.method === "Created")
    const treasuryEventsForMethodEvents = extrinsic.events.filter((_,i) => 
      (i < extrinsic.events.length - 1 ) && 
      extrinsic.events[i+1].event.section === "nfts" &&
      extrinsic.events[i+1].event.method === "Created"
    )
    if (!commonExtrinsicData.isBatch || call.batchMethodIndex === 0){
      const signer = _extrinsic.signer.toString()
      if (methodEvents.length === 0) logger.info("no nfts created events found in this extrinsic: " + extrinsic.extrinsic.hash.toString())
      for (let i = 0; i < methodEvents.length; i++){
        const event = methodEvents[i]
        const [nftId, owner, seriesId, offchain_uri] = event.event.data;
        const record = new NftEntity(nftId.toString())
        insertDataToEntity(record, commonExtrinsicData)
        let convertedSeries = isHex(seriesId.toString()) ? hexToString(seriesId.toString()) : seriesId
        let seriesString = JSON.stringify(convertedSeries).indexOf('u0000') === -1 ? 
          convertedSeries.toString()
        :
          JSON.stringify(convertedSeries).split("u0000").join('')
            .split("\\").join('')
            .split("\"").join('')
        let serieRecord = await SerieEntity.get(seriesString)
        if (!serieRecord){
          serieRecord = new SerieEntity(seriesString)
          serieRecord.owner = signer
          serieRecord.locked = false
          await serieRecord.save()
        }
        record.currency = 'CAPS';
        record.listed = 0;
        record.owner = signer;
        record.serieId = serieRecord.id;
        record.creator = signer;
        record.nftId = nftId.toString();
        record.nftIpfs = isHex(offchain_uri.toString()) ? hexToString(offchain_uri.toString()) : offchain_uri.toString()
        record.isCapsule = false;
        record.frozenCaps = "0";
        await record.save()
        // Record NFT Transfer
        await nftTransferEntityHandler(record, "null address", commonExtrinsicData, "creation")
        // Record Treasury Event
        if (treasuryEventsForMethodEvents[i]){
          await treasuryEventHandler(treasuryEventsForMethodEvents[i], signer, commonExtrinsicData)
        }
        // Update concerned accounts
        await updateAccount(signer, call, extrinsic);
      }
    }else{
      logger.error("Create Nft, can't find if is batch or batch method index");
      logger.error('Create Nft error' + commonExtrinsicData.blockHash);
    }
  }else{
    logger.error('Create Nft error' + commonExtrinsicData.blockHash);
    logger.error('Create Nft is extrinsic success: ' + commonExtrinsicData.isSuccess);
  }
}

export const listHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const { extrinsic: _extrinsic, events } = extrinsic
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  const [nftId, _priceObject, marketplaceId] = call.args
  if (commonExtrinsicData.isSuccess === 1){
    logger.info('nftId:' + nftId + ':new List Nft ' + commonExtrinsicData.blockHash + ' (marketplaceId: ' + marketplaceId+")");
    let price = '';
    let priceTiime = '';
    const priceObject = JSON.parse(_priceObject)
    if (priceObject.caps) {
      price = bnToBn(priceObject.caps).toString();
    } else if (priceObject.tiime) {
      priceTiime = bnToBn(priceObject.tiime).toString();
    } else if (priceObject.combined !== undefined) {
      price = bnToBn(priceObject.combined.caps).toString();
      priceTiime = bnToBn(priceObject.combined.tiime).toString();
    }
    // retieve the nft
    const record = await NftEntity.get(nftId.toString());
    if (record !== undefined) {
      record.listed = 1;
      record.timestampList = new Date();
      try {
        const signer = _extrinsic.signer.toString()
        record.price = price
        record.priceTiime = priceTiime
        record.marketplaceId = marketplaceId
        await record.save()
        // Update concerned accounts
        await updateAccount(signer, call, extrinsic);
      } catch (e) {
        logger.error('list nft error:' + nftId);
        logger.error('list nft error detail: ' + e);
      }
    }
  }else{
    logger.error('list nft error:' + nftId);
    logger.error('list nft error detail: isExtrinsicSuccess ' + commonExtrinsicData.isSuccess);
  }
}

export const unlistHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const { extrinsic: _extrinsic, events } = extrinsic
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  const [nftId] = call.args
  if (commonExtrinsicData.isSuccess === 1){
    logger.info('nftId:' + nftId + ':new Unlist Nft ' + commonExtrinsicData.blockHash);
    let price = '';
    let priceTiime = '';
    // retieve the nft
    const record = await NftEntity.get(nftId.toString());
    if (record !== undefined) {
      record.listed = 0;
      record.timestampList = new Date();
      try {
        const signer = _extrinsic.signer.toString()
        record.price = price
        record.priceTiime = priceTiime
        record.marketplaceId = null;
        await record.save()
        // Update concerned accounts
        await updateAccount(signer, call, extrinsic);
      } catch (e) {
        logger.error('unlist nft error:' + nftId);
        logger.error('unlist nft error detail: ' + e);
      }
    }
  }else{
    logger.error('unlist nft error:' + nftId);
    logger.error('unlist nft error detail: isExtrinsicSuccess ' + commonExtrinsicData.isSuccess);
  }
}

export const buyHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const { extrinsic: _extrinsic } = extrinsic;
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  if (commonExtrinsicData.isSuccess === 1){
    logger.info('Buy Nft ' + commonExtrinsicData.blockHash);
    const methodEvents = extrinsic.events.filter(x => x.event.section === "marketplace" && x.event.method === "NftSold")
    const transferEventsForMethodEvents = extrinsic.events.filter((_,i) => 
      (i < extrinsic.events.length - 1 ) && 
      extrinsic.events[i+1].event.section === "marketplace" &&
      extrinsic.events[i+1].event.method === "NftSold"
    )
    const event = methodEvents[call.batchMethodIndex || 0]
    if (event){
      const signer = _extrinsic.signer.toString()
      const data = event.event.data
      const nftId = data[0].toString()
      const record = await NftEntity.get(nftId.toString());
      if (record !== undefined) {
        const oldOwner = record.owner
        record.owner = signer.toString();
        record.listed = 0;
        record.price = '';
        record.priceTiime = '';
        await record.save()
        // Record NFT Transfer
        const eventTransfer = transferEventsForMethodEvents[call.batchMethodIndex || 0]
        if (eventTransfer && eventTransfer.event && eventTransfer.event.data){
          const amount = (eventTransfer.event.data[2] as Balance).toBigInt().toString();
          await nftTransferEntityHandler(record, oldOwner, commonExtrinsicData, "sale", amount)
        }else{
          logger.error('nft transaction error:' + commonExtrinsicData.blockHash);
        }
      }else{
        logger.error('buy nft error:' + commonExtrinsicData.blockHash);
        logger.error('buy nft error detail: nft not found in db');
      }
    }else{
      logger.error('buy nft error:' + commonExtrinsicData.blockHash);
      logger.error('buy nft error detail: event not fount');
    }
  }else{
    logger.error('buy nft error:' + commonExtrinsicData.blockHash);
    logger.error('buy nft error detail: isExtrinsicSuccess ' + commonExtrinsicData.isSuccess);
  }
}

export const NFTtransferHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const { extrinsic: _extrinsic } = extrinsic
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  const [nftId, newOwner] = call.args
  if (commonExtrinsicData.isSuccess === 1){
    logger.info('Transfer Nft id:' + nftId + '-- block' + commonExtrinsicData.blockHash);
    let data = JSON.parse(JSON.stringify(newOwner))
    const record = await NftEntity.get(nftId.toString());
    if (record !== undefined) {
      const oldOwner = record.owner
      record.listed = 0;
      record.owner = data.id
      await record.save()
      // Record NFT Transfer
      await nftTransferEntityHandler(record, oldOwner, commonExtrinsicData, "transfer")
      await updateAccount(oldOwner, call, extrinsic);
    }
  }else{
    logger.error('Transfer error, Nft id:' + nftId + '-- block' + commonExtrinsicData.blockHash);
  }
}

export const burnHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const { extrinsic: _extrinsic, events } = extrinsic
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  const [nftId] = call.args
  if (commonExtrinsicData.isSuccess === 1){
    logger.info('burn Nft id' + nftId + ' block' + commonExtrinsicData.blockHash);
    // retrieve the nft
    const record = await NftEntity.get(nftId.toString());
    if (record !== undefined) {
      const signer = _extrinsic.signer.toString()
      record.listed = 0;
      record.marketplaceId = null
      record.timestampBurn = new Date();
      await record.save()
      // Record NFT Transfer
      await nftTransferEntityHandler(record, record.owner, commonExtrinsicData, "burn")
      await updateAccount(signer, call, extrinsic);
    }
  }else{
    logger.error('burn failed, Nft id' + nftId + ' block' + commonExtrinsicData.blockHash);
  }
}

export const lockSerieHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const { extrinsic: _extrinsic, events } = extrinsic
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  const [seriesId] = call.args
  if (commonExtrinsicData.isSuccess === 1){
    const convertedSeries = isHex(seriesId.toString()) ? hexToString(seriesId.toString()) : seriesId
    let seriesString = JSON.stringify(convertedSeries).indexOf('u0000') === -1 ? 
          convertedSeries.toString()
        :
          JSON.stringify(convertedSeries).split("u0000").join('')
            .split("\\").join('')
            .split("\"").join('')
    logger.info('locking serie :' + seriesString.toString());
    // retieve the nft
    const record = await SerieEntity.get(seriesString.toString());
    if (record !== undefined) {
      try {
        const signer = _extrinsic.signer.toString()
        record.locked = true
        await record.save()
        await updateAccount(signer, call, extrinsic);
      } catch (e) {
        logger.error('locking serie error:' + seriesId);
        logger.error('locking serie error detail: ' + e);
      }
    }
  }else{
    logger.error('locking serie error:' + seriesId);
    logger.error('locking serie error detail: isExtrinsicSuccess ' + commonExtrinsicData.isSuccess);
  }
}

export const setNFTIpfsHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const { extrinsic: _extrinsic, events } = extrinsic
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  const [id, ipfsReference] = call.args
  if (commonExtrinsicData.isSuccess === 1){
    try {
        const record = await NftEntity.get(id.toString())
        if (record){
          const signer = _extrinsic.signer.toString()
          const oldIpfs = record.nftIpfs
          record.nftIpfs = isHex(ipfsReference.toString()) ? hexToString(ipfsReference.toString()) : ipfsReference.toString()
          await record.save()
          logger.info("NFT change Ipfs: " + JSON.stringify(oldIpfs) + " --> " + JSON.stringify(record.nftIpfs))
          await updateAccount(signer, call, extrinsic);
        }else{
          logger.error('NFT change Ipfs error, NFT id not found at block : ' + commonExtrinsicData.blockId);
        }
    } catch (e) {
        logger.error('NFT change Ipfs error at block: ' + commonExtrinsicData.blockId);
        logger.error('NFT change Ipfs error detail: ' + e);
    }
  }else{
    logger.error('NFT change Ipfs error at block: ' + commonExtrinsicData.blockId);
    logger.error('NFT change Ipfs error detail: isExtrinsicSuccess ' + commonExtrinsicData.isSuccess);
  }
}