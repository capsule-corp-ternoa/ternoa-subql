import { insertDataToEntity, getCommonExtrinsicData } from '../helpers'
import { ExtrinsicHandler } from './types'
import { Balance } from "@polkadot/types/interfaces";
import {NftEntity} from "../types/models/NftEntity";

export const listHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const { extrinsic: _extrinsic } = extrinsic
  console.log(call.args);

}

export const createHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const { extrinsic: _extrinsic } = extrinsic

  const signer = _extrinsic.signer.toString()
  const [to, amount] = call.args
  console.log(call.args);

  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  const nftRecord = new NftEntity(commonExtrinsicData.hash)

  // apply common extrinsic data to record
  insertDataToEntity(nftRecord, commonExtrinsicData)
  nftRecord.owner = signer.toString();
  nftRecord.currency = 'CAPS';
  nftRecord.listed = 0;

}
