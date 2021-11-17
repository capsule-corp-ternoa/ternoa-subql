import { insertDataToEntity, getCommonExtrinsicData, updateAccount } from '../helpers'
import { ExtrinsicHandler } from './types'
import { bnToBn } from '@polkadot/util/bn';
import { NftEntity } from "../types/models/NftEntity";
import { nftTransferEntityHandler } from './nftTransfer';
import { SerieEntity } from '../types';
import { Balance } from '@polkadot/types/interfaces';
import { treasuryEventHandler } from '.';

export const createHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
    const { extrinsic: _extrinsic } = extrinsic
    const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
    if (commonExtrinsicData.isSuccess === 1){
      const record = new NftEntity(commonExtrinsicData.hash)
      // apply common extrinsic data to record
      insertDataToEntity(record, commonExtrinsicData)
      const signer = _extrinsic.signer.toString()
      const [uri, _seriesId] = call.args
      const eventIndex = extrinsic.events.findIndex(x => 
        x.event.section === "nfts" && 
        x.event.method === "Created" && 
        x.event.data &&
        JSON.parse(JSON.stringify(x.event.data))[2] === _seriesId.toString()
      )
      if (eventIndex !== -1){
        const event = extrinsic.events[eventIndex]
        if (event && event.event && event.event.data){
          const [nftId, owner, seriesId, offchain_uri] = event.event.data;
          let serieRecord = await SerieEntity.get(seriesId.toString())
          if (!serieRecord){
            serieRecord = new SerieEntity(seriesId.toString())
            serieRecord.owner = signer
            serieRecord.locked = false
            await serieRecord.save()
          }
          record.currency = 'CAPS';
          record.listed = 0;
          record.owner = signer;
          record.serieId = serieRecord.id;
          record.creator = signer;
          record.id = nftId.toString();
          record.nftId = nftId.toString();
          record.nftIpfs = offchain_uri.toString()
          record.isCapsule = false;
          record.frozenCaps = "0";
          await record.save()
          // Record NFT Transfer
          await nftTransferEntityHandler(record, "null address", commonExtrinsicData, "creation")
          // Record Treasury Event
          const treasuryEvent = eventIndex > 0 ? extrinsic.events[eventIndex-1] : null
          if (treasuryEvent){
            await treasuryEventHandler(treasuryEvent, signer, commonExtrinsicData)
          }
          await updateAccount(signer, call, extrinsic);
        }else{
          logger.error('Create Nft error' + commonExtrinsicData.blockHash);
        }
      }else{
        logger.error('create Nft error: Created event not found')
      }
    }else{
      logger.error('Create Nft error' + commonExtrinsicData.blockHash);
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
        record.price = price
        record.priceTiime = priceTiime
        record.marketplaceId = marketplaceId
        await record.save()
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
        record.price = price
        record.priceTiime = priceTiime
        record.marketplaceId = null;
        await record.save()
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
    // sold event
    const event = extrinsic.events.find(x => x.event.section === "marketplace" && x.event.method === "NftSold")
    const eventTransfer = extrinsic.events.find(x => x.event.section === "balances" && x.event.method === "Transfer")
    if (event && event.event && event.event.data){
      const data = event.event.data
      const nftId = data[0].toString()
      const signer = _extrinsic.signer.toString()
  
      // retrieve the nft
      const record = await NftEntity.get(nftId.toString());
      if (record !== undefined) {
        const oldOwner = record.owner
        record.owner = signer.toString();
        record.listed = 0;
        await record.save()
        // Record NFT Transfer
        if (eventTransfer && eventTransfer.event && eventTransfer.event.data){
          const amount = (eventTransfer.event.data[2] as Balance).toBigInt().toString();
          await nftTransferEntityHandler(record, oldOwner, commonExtrinsicData, "sale", amount)
        }else{
          logger.error('nft transaction error:' + commonExtrinsicData.blockHash);
        }
      }
    }else{
      logger.error('buy nft error:' + commonExtrinsicData.blockHash);
    }
  }else{
    logger.error('buy nft error:' + commonExtrinsicData.blockHash);
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
      record.listed = 0;
      record.marketplaceId = null
      record.timestampBurn = new Date();
      await record.save()
      // Record NFT Transfer
      await nftTransferEntityHandler(record, record.owner, commonExtrinsicData, "burn")
    }
  }else{
    logger.error('burn failed, Nft id' + nftId + ' block' + commonExtrinsicData.blockHash);
  }
}

export const lockSerieHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const { extrinsic: _extrinsic, events } = extrinsic
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  const [serieId] = call.args
  if (commonExtrinsicData.isSuccess === 1){
    logger.info('locking serie :' + serieId);
    // retieve the nft
    const record = await SerieEntity.get(serieId.toString());
    if (record !== undefined) {
      try {
        record.locked = true
         await record.save()
      } catch (e) {
        logger.error('locking serie error:' + serieId);
        logger.error('locking serie error detail: ' + e);
      }
    }
  }else{
    logger.error('locking serie error:' + serieId);
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
          const oldIpfs = record.nftIpfs
          record.nftIpfs = ipfsReference.toString()
          await record.save()
          logger.info("NFT change Ipfs: " + JSON.stringify(oldIpfs) + " --> " + JSON.stringify(record.nftIpfs))
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