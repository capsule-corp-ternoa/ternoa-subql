import {insertDataToEntity, getCommonExtrinsicData, updateAccount} from '../helpers'
import { ExtrinsicHandler } from './types'
import { Balance } from "@polkadot/types/interfaces";
import { bnToBn } from '@polkadot/util/bn';
import { NftEntity } from "../types/models/NftEntity";
import { TransferEntity } from "../types/models/TransferEntity";

  export const createHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
    const { extrinsic: _extrinsic, events } = extrinsic
    const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
    const record = new NftEntity(commonExtrinsicData.hash)
    logger.info('Create Nft');

    for (const {event: {data, method, section}} of events) {
      if (`${section}.${method}` === 'nfts.Created') {
        // apply common extrinsic data to record
        insertDataToEntity(record, commonExtrinsicData)
        const signer = _extrinsic.signer.toString()
        const nftId = data[0].toString()
        const nftData = await api.query.nfts.data(nftId);
        record.currency = 'CAPS';
        record.listed = 0;
        record.owner = signer;
        record.serieId = data[2].toString();
        record.creator = signer;
        record.id = nftId;
        // @ts-ignore
        const offchain_uri = Buffer.from(nftData.details.offchain_uri, 'hex');
        record.uri = offchain_uri.toString();
        await record.save()
      }
    }

  }

  export const listHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
    const {extrinsic: _extrinsic, events} = extrinsic
    logger.info('List Nft');

    if (events.length > 0 && events[0].event !== undefined) {
      const nftId = events[0].event.data[0].toString()

      let price = '';
      let priceTiime = '';
      const priceObject = JSON.parse(events[0].event.data[1].toString());
      if(priceObject.caps) {
        price = bnToBn(priceObject.caps).toString();
      } else if (priceObject.tiime) {
        priceTiime = bnToBn(priceObject.tiime).toString();
      }else if (priceObject.combined !== undefined) {
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
          await record.save()
        } catch (e) {
          // @ts-ignore
          logger.error(events[0].event.data[1].toString());
        }
      }
    }
  }

export const buyHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const {extrinsic: _extrinsic, events} = extrinsic;

  for (const {event: {data, method, section}} of events) {
    if (`${section}.${method}` === 'balances.Transfer') {
      // transfer
      const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
      const transferRecord = new TransferEntity(commonExtrinsicData.hash)
      const [from,to, amount] = data;
      // apply common extrinsic data to record
      insertDataToEntity(transferRecord, commonExtrinsicData)
      transferRecord.from = from.toString()
      transferRecord.to = to.toString()
      transferRecord.currency = 'CAPS'
      transferRecord.amount = (amount as Balance).toBigInt().toString();

      await updateAccount(transferRecord.from, call, extrinsic);
      await updateAccount(transferRecord.to, call, extrinsic);

      await transferRecord.save()

    }else if (`${section}.${method}` === 'marketplace.NftSold'){
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

}

export const NFTtransferHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const { extrinsic: _extrinsic, events } = extrinsic

  if(events.length > 0 && events[0].event !== undefined ){
    console.log('events[0].event.data',events[0].event.data)
    const nftId = events[0].event.data[0].toString()
    const oldOwner = events[0].event.data[1].toString()
    const newOwner = events[0].event.data[2].toString()

    // retrieve the nft
    const record = await NftEntity.get(nftId);
    if( record !== undefined ){
      record.listed = 0;
      record.owner = newOwner

      await record.save()
    }
  }

}

export const burnHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const { extrinsic: _extrinsic, events } = extrinsic

  if(events.length > 0 && events[0].event !== undefined ){
    const nftId = events[0].event.data[0].toString()

    // retrieve the nft
    const record = await NftEntity.get(nftId);
    if( record !== undefined ){
      record.listed = 0;
      record.timestampBurn = new Date();
      await record.save()
    }
  }

}
