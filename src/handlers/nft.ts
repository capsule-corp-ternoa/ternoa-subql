import { insertDataToEntity, getCommonExtrinsicData } from '../helpers'
import { ExtrinsicHandler } from './types'
import { Balance } from "@polkadot/types/interfaces";
import {NftEntity} from "../types/models/NftEntity";

export const createHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const { extrinsic: _extrinsic, events } = extrinsic

  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  const record = new NftEntity(commonExtrinsicData.hash)

  // apply common extrinsic data to record
  insertDataToEntity(record, commonExtrinsicData)

  const signer = _extrinsic.signer.toString()
  const nftId = events[0].event.data[0].toString()
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
    await record.save()

  }
}

export const listHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const { extrinsic: _extrinsic, events } = extrinsic

  if(events.length > 0 && events[0].event !== undefined ){
    const nftId = events[0].event.data[0].toString()
    const price = events[0].event.data[1]

    // retieve the nft
    const record = await NftEntity.get(nftId);
    if( record !== undefined ){
      record.listed = 1;
      record.timestampList = new Date();
      record.price = (price as Balance).toBigInt().toString();
      await record.save()
    }


  }

}
