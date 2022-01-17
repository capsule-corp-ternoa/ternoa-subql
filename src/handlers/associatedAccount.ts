import { getCommonExtrinsicData, updateAccount } from '../helpers'
import { ExtrinsicHandler } from './types'
import { AssociatedAccountEntity } from '../types';
import { hexToString, isHex } from '../utils';

export const addAssociatedAccountHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const date = new Date()
  const { extrinsic: _extrinsic, events } = extrinsic
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  const method = call.method
  const [value] = call.args
  const accountName = method === "setAltvrUsername" ? "AltVR" : "AltVR"
  if (commonExtrinsicData.isSuccess === 1){
    try {
        const signer = _extrinsic.signer.toString()
        let record = await AssociatedAccountEntity.get(signer)
        if (!record){
            record = new AssociatedAccountEntity(signer)
            record.accountName = []
            record.accountValue = []
            record.createdAt = date
        }
        const indexesToDelete:number[] = record.accountName.reduce(function(arr, element, index) {
          if (element === accountName) arr.push(index);
          return arr;
        }, []);
        record.accountName = record.accountName.filter((_x,i) => !indexesToDelete.includes(i))
        record.accountValue = record.accountValue.filter((_x,i) => !indexesToDelete.includes(i))
        let accountValue = isHex(value.toString()) ? hexToString(value.toString()) : value.toString()
        record.accountName.push(accountName)
        record.accountValue.push(accountValue)
        record.updatedAt = date
        await record.save()
        logger.info("add associated account: " + accountName + " --> " + accountValue)
        // Update concerned accounts
        await updateAccount(signer, call, extrinsic);
    } catch (e) {
        logger.error('add associated account error at block: ' + commonExtrinsicData.blockId);
        logger.error('add associated account error detail: ' + e);
    }
  }else{
    logger.error('add associated account error at block: ' + commonExtrinsicData.blockId);
    logger.error('add associated account error detail: isExtrinsicSuccess ' + commonExtrinsicData.isSuccess);
  }
}