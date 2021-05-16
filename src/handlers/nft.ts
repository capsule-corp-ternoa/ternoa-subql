import { insertDataToEntity, getCommonExtrinsicData } from '../helpers'
import { ExtrinsicHandler } from './types'
import { Balance } from "@polkadot/types/interfaces";
import { NftEntity } from "../types/models/NftEntity";
import { TransferEntity } from "../types/models/TransferEntity";

  export const createHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
    const { extrinsic: _extrinsic, events } = extrinsic

    const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
    const record = new NftEntity(commonExtrinsicData.hash)
    // apply common extrinsic data to record
    insertDataToEntity(record, commonExtrinsicData)

    const signer = _extrinsic.signer.toString()
    const nftId = events[0].event.data[0].toString()
    try{
      const nftData = await api.query.nfts.data(nftId);
      if(events.length > 0 && events[0].event !== undefined ){
        record.currency = 'CAPS';
        record.listed = 0;
        record.owner = signer;
        record.creator = signer;
        record.id = nftId;
        // @ts-ignore
        const offchain_uri = Buffer.from(nftData.details.offchain_uri, 'hex');
        record.uri = offchain_uri.toString();
        // check if series of nfts
        // @TODO: waiting for pallet
        await record.save()
      }
    }catch( err ){
      console.log('error of nft id')
    }
  }

  export const listHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
    const {extrinsic: _extrinsic, events} = extrinsic
    if (events.length > 0 && events[0].event !== undefined) {
      const nftId = events[0].event.data[0].toString()
      const price = events[0].event.data[1]

      // retieve the nft
      const record = await NftEntity.get(nftId);
      if (record !== undefined) {
        record.listed = 1;
        record.timestampList = new Date();
        record.price = (price as Balance).toBigInt().toString();
        await record.save()
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
