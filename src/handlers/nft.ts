import { insertDataToEntity, getCommonExtrinsicData, updateAccount } from '../helpers'
import { ExtrinsicHandler } from './types'
import { bnToBn } from '@polkadot/util/bn';
import { NftEntity } from "../types/models/NftEntity";
import { nftTransferEntityHandler } from './nftTransfer';
import { SerieEntity } from '../types';
import { Balance } from '@polkadot/types/interfaces';
import { genericTransferHandler } from '.';
import { formatString, roundPrice} from '../utils';

export const createHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const { extrinsic: _extrinsic } = extrinsic
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  const date = new Date()
  if (commonExtrinsicData.isSuccess === 1){
    if (commonExtrinsicData.isBatch === 1) logger.info("NFT Create Batch handled")
    const methodEvents = extrinsic.events.filter(x => x.event.section === "nfts" && x.event.method === "Created")
    const treasuryEventsOriginalIndexes:number[] = []
    const treasuryEventsForMethodEvents = extrinsic.events.filter((_,i) => {
      if (i < extrinsic.events.length - 1 && extrinsic.events[i+1].event.section === "nfts" && extrinsic.events[i+1].event.method === "Created"){
        treasuryEventsOriginalIndexes.push(i)
        return true
      }
      return false
    })
    const signer = _extrinsic.signer.toString()
    if (methodEvents.length === 0) logger.info("no nfts created events found in this extrinsic: " + extrinsic.extrinsic.hash.toString())
    const event = methodEvents[call.batchMethodIndex || 0]
    const treasuryEvent = treasuryEventsForMethodEvents[call.batchMethodIndex || 0]
    const [nftId, owner, seriesId, offchain_uri] = event.event.data;
    const record = new NftEntity(nftId.toString())
    insertDataToEntity(record, commonExtrinsicData)
    let seriesString = formatString(seriesId.toString())
    let serieRecord = await SerieEntity.get(seriesString)
    if (!serieRecord){
      serieRecord = new SerieEntity(seriesString)
      serieRecord.owner = signer
      serieRecord.locked = false
      serieRecord.createdAt = date
      serieRecord.updatedAt = date
      await serieRecord.save()
    }
    record.currency = 'CAPS';
    record.listed = 0;
    record.isLocked = false;
    record.owner = signer;
    record.serieId = serieRecord.id;
    record.creator = signer;
    record.nftId = nftId.toString();
    record.nftIpfs = formatString(offchain_uri.toString())
    record.isCapsule = false;
    record.frozenCaps = "0";
    record.timestampCreate = commonExtrinsicData.timestamp
    record.createdAt = date
    record.updatedAt = date
    await record.save()
    // Record NFT Transfer
    await nftTransferEntityHandler(record, "null address", commonExtrinsicData, "creation")
    // Record Treasury Event
    if (treasuryEvent){
      const [amount] = treasuryEvent.event.data
      const extrinsicIndex = treasuryEvent.phase.isApplyExtrinsic ? treasuryEvent.phase.asApplyExtrinsic.toNumber() : 0
      await genericTransferHandler(signer.toString(), 'Treasury', amount, commonExtrinsicData, treasuryEventsOriginalIndexes[call.batchMethodIndex || 0], extrinsicIndex)
    }
    // Update concerned accounts
    await updateAccount(signer);
  }else{
    logger.error('Create Nft error' + commonExtrinsicData.blockHash);
    logger.error('Create Nft is extrinsic success: ' + commonExtrinsicData.isSuccess);
  }
}

export const listHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const date = new Date()
  const { extrinsic: _extrinsic, events } = extrinsic
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  const [nftId, _priceObject, marketplaceId] = call.args
  if (commonExtrinsicData.isSuccess === 1){
    logger.info('nftId:' + nftId + ':new List Nft ' + commonExtrinsicData.blockHash + ' (marketplaceId: ' + marketplaceId+")");
    let price = '';
    const priceObject = JSON.parse(_priceObject)
    if (priceObject.caps) price = bnToBn(priceObject.caps).toString()
    // retieve the nft
    const record = await NftEntity.get(nftId.toString());
    if (record !== undefined) {
      record.listed = 1;
      record.isLocked = true;
      record.timestampList = date;
      try {
        const signer = _extrinsic.signer.toString()
        record.price = price
        record.priceRounded = roundPrice(record.price);
        record.marketplaceId = marketplaceId
        record.updatedAt = date
        await record.save()
        // Update concerned accounts
        await updateAccount(signer);
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
  const date = new Date()
  const { extrinsic: _extrinsic, events } = extrinsic
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  const [nftId] = call.args
  if (commonExtrinsicData.isSuccess === 1){
    logger.info('nftId:' + nftId + ':new Unlist Nft ' + commonExtrinsicData.blockHash);
    // retieve the nft
    const record = await NftEntity.get(nftId.toString());
    if (record !== undefined) {
      record.listed = 0;
      record.isLocked = false;
      record.timestampList = date;
      const signer = _extrinsic.signer.toString()
      record.price = ""
      record.priceRounded = null
      record.marketplaceId = null;
      record.updatedAt = date
      await record.save()
      // Update concerned accounts
      await updateAccount(signer);
    }
  }else{
    logger.error('unlist nft error:' + nftId);
    logger.error('unlist nft error detail: isExtrinsicSuccess ' + commonExtrinsicData.isSuccess);
  }
}

export const buyHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const date = new Date()
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
        const marketplaceId = record.marketplaceId
        record.owner = signer.toString();
        record.listed = 0;
        record.marketplaceId = null;
        record.isLocked = false;
        record.price = '';
        record.priceRounded = null;
        record.updatedAt = date
        await record.save()
        // Record NFT Transfer
        const eventTransfer = transferEventsForMethodEvents[call.batchMethodIndex || 0]
        if (eventTransfer && eventTransfer.event && eventTransfer.event.data){
          const amount = (eventTransfer.event.data[2] as Balance).toBigInt().toString();
          await nftTransferEntityHandler(record, oldOwner, commonExtrinsicData, "sale", amount, marketplaceId)
          await genericTransferHandler(signer.toString(), oldOwner.toString(), amount, commonExtrinsicData, call.batchMethodIndex || 0, Number(commonExtrinsicData.extrinsicId))
        }else{
          logger.error('nft transaction error:' + commonExtrinsicData.blockHash);
        }
        await updateAccount(signer);
        await updateAccount(oldOwner);
      }else{
        logger.error('buy nft error: for NFT id - ' + nftId.toString() + " at hash " + commonExtrinsicData.blockHash);
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
  const date = new Date()
  const { extrinsic: _extrinsic } = extrinsic
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  const [nftId, newOwner] = call.args
  if (commonExtrinsicData.isSuccess === 1){
    logger.info('Transfer Nft id:' + nftId + ' -- block: ' + commonExtrinsicData.blockHash);
    let data = JSON.parse(JSON.stringify(newOwner))
    const record = await NftEntity.get(nftId.toString());
    if (record !== undefined) {
      const oldOwner = record.owner
      record.owner = data.id
      record.updatedAt = date
      await record.save()
      // Record NFT Transfer
      await nftTransferEntityHandler(record, oldOwner, commonExtrinsicData, "transfer")
      await updateAccount(oldOwner);
    }
  }else{
    logger.error('Transfer error, Nft id:' + nftId + ' -- block: ' + commonExtrinsicData.blockHash);
  }
}

export const burnHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const date = new Date()
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
      record.timestampBurn = date;
      record.updatedAt = date
      await record.save()
      // Record NFT Transfer
      await nftTransferEntityHandler(record, record.owner, commonExtrinsicData, "burn")
      await updateAccount(signer);
    }
  }else{
    logger.error('burn failed, Nft id' + nftId + ' block' + commonExtrinsicData.blockHash);
  }
}

export const lockSerieHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const date = new Date()
  const { extrinsic: _extrinsic, events } = extrinsic
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  const [seriesId] = call.args
  if (commonExtrinsicData.isSuccess === 1){
    const seriesString = formatString(seriesId.toString())
    logger.info('locking serie :' + seriesString.toString());
    // retieve the nft
    const record = await SerieEntity.get(seriesString.toString());
    if (record !== undefined) {
      try {
        const signer = _extrinsic.signer.toString()
        record.locked = true
        record.updatedAt = date
        await record.save()
        await updateAccount(signer);
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
  const date = new Date()
  const { extrinsic: _extrinsic, events } = extrinsic
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  const [id, ipfsReference] = call.args
  if (commonExtrinsicData.isSuccess === 1){
    try {
        const record = await NftEntity.get(id.toString())
        if (record){
          const signer = _extrinsic.signer.toString()
          const oldIpfs = record.nftIpfs
          record.nftIpfs = formatString(ipfsReference.toString())
          record.updatedAt = date
          await record.save()
          logger.info("NFT change Ipfs: " + JSON.stringify(oldIpfs) + " --> " + JSON.stringify(record.nftIpfs))
          await updateAccount(signer);
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