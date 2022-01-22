import { getCommonExtrinsicData, updateAccount } from '../helpers'
import { ExtrinsicHandler } from './types'
import { genericTransferHandler } from '.';

export const transferHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const { extrinsic: _extrinsic } = extrinsic
  const signer = _extrinsic.signer.toString()
  const [to, amount] = call.args
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  await genericTransferHandler(signer.toString(), to.toString(), amount, commonExtrinsicData)
  logger.info('transfer');
  // update account
  await updateAccount(to.toString());
  await updateAccount(signer.toString());
}