import { getCommonExtrinsicData, updateAccount } from '../helpers'
import { ExtrinsicHandler } from './types'
import { genericTransferHandler } from '.';

export const transferHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const { extrinsic: _extrinsic } = extrinsic
  const signer = _extrinsic.signer.toString()
  const [to, amount] = call.args
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  const methodEvents = extrinsic.events.filter(x => x.event.section === "balances" && x.event.method === "Transfer")
  const event = methodEvents[call.batchMethodIndex || 0]
  const extrinsicIndex = event.phase.isApplyExtrinsic ? event.phase.asApplyExtrinsic.toNumber() : 0
  await genericTransferHandler(signer.toString(), to.toString(), amount, commonExtrinsicData, call.batchMethodIndex || 0, extrinsicIndex)
  logger.info('transfer');
  // update account
  await updateAccount(to.toString());
  await updateAccount(signer.toString());
}