import { insertDataToEntity, getCommonExtrinsicData, updateAccount } from '../helpers'
import { ExtrinsicHandler } from './types'
import { Balance } from "@polkadot/types/interfaces";
import { bnToBn } from '@polkadot/util/bn';
import { NftEntity } from "../types/models/NftEntity";
import { TransferEntity } from "../types/models/TransferEntity";

export const createHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const { extrinsic: _extrinsic, events } = extrinsic
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  if (commonExtrinsicData.isSuccess === 1){
    const record = new NftEntity(commonExtrinsicData.hash)
    // logger.info('Create Nft ' + commonExtrinsicData.block);
    for (const { event: { data, method, section } } of events) {
      if (`${section}.${method}` === 'treasury.Deposit') {
        // apply common extrinsic data to record
        const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
        const transferRecord = new TransferEntity(commonExtrinsicData.hash)
        const from = _extrinsic.signer.toString()
        const [ amount] = data;
        // apply common extrinsic data to record
        insertDataToEntity(transferRecord, commonExtrinsicData)
        transferRecord.from = from.toString()
        transferRecord.to = 'Treasury'
        transferRecord.currency = 'CAPS'
        transferRecord.amount = (amount as Balance).toBigInt().toString();
        await updateAccount(transferRecord.from, call, extrinsic);
        await transferRecord.save()
      }else  if (`${section}.${method}` === 'nfts.Created') {
        // apply common extrinsic data to record
        insertDataToEntity(record, commonExtrinsicData)
        const signer = _extrinsic.signer.toString()
        const [nftId, owner, seriesId, _offchain_uri]= data;
        record.currency = 'CAPS';
        record.listed = 0;
        record.owner = signer;
        record.serieId = seriesId.toString();
        record.creator = signer;
        record.id = nftId.toString();
        // @ts-ignore
        const offchain_uri = Buffer.from(_offchain_uri, 'hex');
        record.uri = offchain_uri.toString();
        await record.save()
      }
    }
  }else{
    logger.info('Create Nft error' + commonExtrinsicData.block);
  }
}

export const listHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const { extrinsic: _extrinsic, events } = extrinsic
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  const [nftId, _priceObject, marketplaceId] = call.args
  if (commonExtrinsicData.isSuccess === 1){
    logger.info('nftId:' + nftId + ':new List Nft ' + commonExtrinsicData.block + ' (marketplaceId: ' + marketplaceId);
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
        // @ts-ignore
        logger.error('list nft error:' + nftId);
      }
    }
  }else{
    logger.error('list nft error:' + nftId);
  }
}

export const unlistHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const { extrinsic: _extrinsic, events } = extrinsic
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  const [nftId] = call.args
  if (commonExtrinsicData.isSuccess === 1){
    logger.info('nftId:' + nftId + ':new Unlist Nft ' + commonExtrinsicData.block);
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
        // @ts-ignore
        logger.error('unlist nft error:' + nftId);
      }
    }
  }else{
    logger.error('unlist nft error:' + nftId);
  }
}

export const buyHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const { extrinsic: _extrinsic, events } = extrinsic;
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  if (commonExtrinsicData.isSuccess === 1){
    logger.info('Buy Nft ' + commonExtrinsicData.block);
    for (const { event: { data, method, section } } of events) {
      if (`${section}.${method}` === 'balances.Transfer') {
        // transfer
        const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
        const transferRecord = new TransferEntity(commonExtrinsicData.hash)
        const [from, to, amount] = data;
        // apply common extrinsic data to record
        insertDataToEntity(transferRecord, commonExtrinsicData)
        transferRecord.from = from.toString()
        transferRecord.to = to.toString()
        transferRecord.currency = 'CAPS'
        transferRecord.amount = (amount as Balance).toBigInt().toString();

        await updateAccount(transferRecord.from, call, extrinsic);
        await updateAccount(transferRecord.to, call, extrinsic);

        await transferRecord.save()

      } else if (`${section}.${method}` === 'marketplace.NftSold') {
        // sold event
        const nftId = data[0].toString()
        const signer = _extrinsic.signer.toString()

        // retrieve the nft
        const record = await NftEntity.get(nftId);
        if (record !== undefined) {
          record.owner = signer.toString();
          record.listed = 0;
          await record.save()
        }
      }
    }
  }else{
    logger.error('buy nft error:' + commonExtrinsicData.block);

  }
}

export const NFTtransferHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const { extrinsic: _extrinsic, events } = extrinsic
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  const [nftId, newOwner] = call.args
  if (commonExtrinsicData.isSuccess === 1){
    logger.info('Transfer Nft id:' + nftId + '-- block' + commonExtrinsicData.block);
    // logger.info('Transfer Nft newOwner:' + newOwner);
    // logger.info('Transfer Nft newOwner.id:' + newOwner.id);
    // logger.info('Transfer Nft call.args:' + call.args);
    // logger.info('Transfer Nft string call.args:' + JSON.stringify(call.args));
    let data = JSON.parse(JSON.stringify(newOwner))
    // logger.info('Transfer Nft data:' + data);
    // logger.info('Transfer Nft data.id:' + data.id);
    //REASON: newOwner logs as address but saved as .id, 
    //.id is not accessable on it
    //that is way need to stringify->parse->get id
    // retrieve the nft
    const record = await NftEntity.get(nftId);
    if (record !== undefined) {
      record.listed = 0;
      record.owner = data.id
  
      await record.save()
    }
  }else{
    logger.info('Transfer error, Nft id:' + nftId + '-- block' + commonExtrinsicData.block);
  }
}

export const burnHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const { extrinsic: _extrinsic, events } = extrinsic
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  const [nftId] = call.args
  if (commonExtrinsicData.isSuccess === 1){
    logger.info('burn Nft id' + nftId + ' block' + commonExtrinsicData.block);
    // retrieve the nft
    const record = await NftEntity.get(nftId);
    if (record !== undefined) {
      record.listed = 0;
      record.timestampBurn = new Date();
      await record.save()
    }
  }else{
    logger.info('burn failed, Nft id' + nftId + ' block' + commonExtrinsicData.block);
  }
}