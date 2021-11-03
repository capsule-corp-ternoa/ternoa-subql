import { Balance } from "@polkadot/types/interfaces";
import { getCommonExtrinsicData, insertDataToEntity, updateAccount } from '../helpers'
import { ExtrinsicHandler } from './types'
import { TransferEntity } from '../types';

export const treasuryDepositHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  try{
    const { extrinsic: _extrinsic } = extrinsic
    const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
    if (commonExtrinsicData.isSuccess === 1){
      const transferRecord = new TransferEntity(commonExtrinsicData.hash)
      const from = _extrinsic.signer.toString()
      const [amount] = call.args;
      // apply common extrinsic data to record
      insertDataToEntity(transferRecord, commonExtrinsicData)
      transferRecord.from = from.toString()
      transferRecord.to = 'Treasury'
      transferRecord.currency = 'CAPS'
      transferRecord.amount = (amount as Balance).toBigInt().toString();
      await transferRecord.save()
      await updateAccount(transferRecord.from, call, extrinsic);
    }else{
      logger.error('treasury deposit error');
      logger.error('treasury deposit error detail: isExtrinsicSuccess ' + commonExtrinsicData.isSuccess);
    }
  }catch(err){
    logger.error('treasury deposit error');
    logger.error('treasury deposit error detail: ' + err);
  }
}