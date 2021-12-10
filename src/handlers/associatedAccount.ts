import { getCommonExtrinsicData } from '../helpers'
import { ExtrinsicHandler } from './types'
import { AssociatedAccountEntity } from '../types';
import { hexToString, isHex } from '../utils';

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
        let accountValue = isHex(value.toString()) ? hexToString(value.toString()) : value.toString()
        record.accountValue.push(accountValue.toString())
        await record.save()
        logger.info("add associated account: " + accountName + " --> " + accountValue.toString())
    } catch (e) {
        logger.error('add associated account error at block: ' + commonExtrinsicData.blockId);
        logger.error('add associated account error detail: ' + e);
    }
  }else{
    logger.error('add associated account error at block: ' + commonExtrinsicData.blockId);
    logger.error('add associated account error detail: isExtrinsicSuccess ' + commonExtrinsicData.isSuccess);
  }
}