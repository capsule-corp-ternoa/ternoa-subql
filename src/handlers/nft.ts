import { insertDataToEntity, getCommonExtrinsicData, updateAccount } from '../helpers'
import { ExtrinsicHandler } from './types'
import { bnToBn } from '@polkadot/util/bn';
import { NftEntity } from "../types/models/NftEntity";
import { nftTransferEntityHandler } from './nftTransfer';
import { SerieEntity, TransferEntity } from '../types';
import { Balance } from '@polkadot/types/interfaces';

export const createHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
    const { extrinsic: _extrinsic } = extrinsic
    const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
    if (commonExtrinsicData.isSuccess === 1){
      const record = new NftEntity(commonExtrinsicData.hash)
      // apply common extrinsic data to record
      insertDataToEntity(record, commonExtrinsicData)
      const signer = _extrinsic.signer.toString()
      const { series_id } = JSON.parse(call.args[0]);
      const eventIndex = extrinsic.events.findIndex(x => 
        x.event.section === "nfts" && 
        x.event.method === "Created" && 
        x.event.data &&
        JSON.parse(JSON.stringify(x.event.data))[2] === series_id
      )
      if (eventIndex !== -1){
        const event = extrinsic.events[eventIndex]
        const treasuryEvent = eventIndex > 0 ? extrinsic.events[eventIndex-1] : null
        if (event && event.event && event.event.data){
          const [nftId, owner, seriesId, _offchain_uri] = event.event.data;
          const offchain_uri = Buffer.from(_offchain_uri as any, 'hex');
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
          record.uri = offchain_uri.toString();
          record.nftIpfs = offchain_uri.toString();
          record.isCapsule = false;
          record.frozenCaps = "0";
          await record.save()
          if (treasuryEvent){
            const transferRecord = new TransferEntity(commonExtrinsicData.hash)
            const [amount] = treasuryEvent.event.data
            logger.info("amount: " + amount)
            insertDataToEntity(transferRecord, commonExtrinsicData)
            transferRecord.from = signer
            transferRecord.to = 'Treasury'
            transferRecord.currency = 'CAPS'
            transferRecord.amount = (amount as Balance).toBigInt().toString();
            await transferRecord.save()
            await updateAccount(transferRecord.from, call, extrinsic);
          }
        }else{
          logger.info('Create Nft error' + commonExtrinsicData.blockHash);
        }
      }
    }else{
      logger.info('Create Nft error' + commonExtrinsicData.blockHash);
    }
}

export const listHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const { extrinsic: _extrinsic, events } = extrinsic
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  const [nftId, _priceObject, marketplaceId] = call.args
  if (commonExtrinsicData.isSuccess === 1){
    logger.info('nftId:' + nftId + ':new List Nft ' + commonExtrinsicData.blockHash + ' (marketplaceId: ' + marketplaceId);
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
    const record = await NftEntity.get(nftId);
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
    const record = await NftEntity.get(nftId);
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
      const record = await NftEntity.get(nftId);
      if (record !== undefined) {
        const oldOwner = record.owner
        record.owner = signer.toString();
        record.listed = 0;
        await record.save()
        // Record NFT Transfer
        if (eventTransfer && eventTransfer.event && eventTransfer.event.data){
          const amount = (eventTransfer.event.data[2] as Balance).toBigInt().toString();
          await nftTransferEntityHandler(record, oldOwner, commonExtrinsicData, true, amount)
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
    const record = await NftEntity.get(nftId);
    if (record !== undefined) {
      const oldOwner = record.owner
      record.listed = 0;
      record.owner = data.id
      await record.save()
      // Record NFT Transfer
      await nftTransferEntityHandler(record, oldOwner, commonExtrinsicData)
      await updateAccount(data.id, call, extrinsic);
    }
  }else{
    logger.info('Transfer error, Nft id:' + nftId + '-- block' + commonExtrinsicData.blockHash);
  }
}

export const burnHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const { extrinsic: _extrinsic, events } = extrinsic
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  const [nftId] = call.args
  if (commonExtrinsicData.isSuccess === 1){
    logger.info('burn Nft id' + nftId + ' block' + commonExtrinsicData.blockHash);
    // retrieve the nft
    const record = await NftEntity.get(nftId);
    if (record !== undefined) {
      record.listed = 0;
      record.timestampBurn = new Date();
      await record.save()
    }
  }else{
    logger.info('burn failed, Nft id' + nftId + ' block' + commonExtrinsicData.blockHash);
  }
}