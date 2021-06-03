import { insertDataToEntity, getCommonExtrinsicData, updateAccount } from '../helpers'
import { TransferEntity } from '../types/models/TransferEntity'
import { ExtrinsicHandler } from './types'
import { Balance } from "@polkadot/types/interfaces";
import { AccountEntity } from "../types/models/AccountEntity";

export const transferHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const { extrinsic: _extrinsic } = extrinsic
  const signer = _extrinsic.signer.toString()
  const [to, amount] = call.args
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  const transferRecord = new TransferEntity(commonExtrinsicData.hash)

  // apply common extrinsic data to record
  insertDataToEntity(transferRecord, commonExtrinsicData)
  transferRecord.from = signer.toString()
  transferRecord.to = to.toString()
  transferRecord.currency = 'CAPS'
  transferRecord.amount = (amount as Balance).toBigInt().toString();

  await transferRecord.save()
  console.log('transfer');
  // update account
  await updateAccount(to, call, extrinsic);
  await updateAccount(signer, call, extrinsic);

}



export const transferTiimeHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const { extrinsic: _extrinsic } = extrinsic
  const signer = _extrinsic.signer.toString()
  const [to, amount] = call.args
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  const transferRecord = new TransferEntity(commonExtrinsicData.hash)

  // apply common extrinsic data to record
  insertDataToEntity(transferRecord, commonExtrinsicData)
  transferRecord.from = signer.toString()
  transferRecord.to = to.toString()
  transferRecord.currency = 'TIIME'
  transferRecord.amount = (amount as Balance).toBigInt().toString();

  await transferRecord.save()

  // update account
  // update account
  await updateAccount(to, call, extrinsic);
  await updateAccount(signer, call, extrinsic);

}
