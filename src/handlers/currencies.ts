import { insertDataToEntity, getCommonExtrinsicData } from '../helpers'
import { TransferEntity } from '../types/models/TransferEntity'
import { ExtrinsicHandler } from './types'
import { Balance } from "@polkadot/types/interfaces";

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
}
