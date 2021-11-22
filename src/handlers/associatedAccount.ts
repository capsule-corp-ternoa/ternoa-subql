import { getCommonExtrinsicData } from '../helpers'
import { ExtrinsicHandler } from './types'
import { AssociatedAccountEntity } from '../types';

export const addAssociatedAccountHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const { extrinsic: _extrinsic, events } = extrinsic
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  const method = call.method
  const [value] = call.args
  const accountName = method === "setAltvrUsername" ? "AltVR" : "AltVR"
  if (commonExtrinsicData.isSuccess === 1){
    try {
        const address = _extrinsic.signer.toString()
        let record = await AssociatedAccountEntity.get(address)
        if (!record){
            record = new AssociatedAccountEntity(address)
            record.accountName = []
            record.accountValue = []
        }
        record.accountName.push(accountName)
        record.accountValue.push(value.toString())
        await record.save()
        logger.info("add associated account: " + accountName + " --> " + value.toString())
    } catch (e) {
        logger.error('add associated account error at block: ' + commonExtrinsicData.blockId);
        logger.error('add associated account error detail: ' + e);
    }
  }else{
    logger.error('add associated account error at block: ' + commonExtrinsicData.blockId);
    logger.error('add associated account error detail: isExtrinsicSuccess ' + commonExtrinsicData.isSuccess);
  }
}