import { insertDataToEntity, getCommonExtrinsicData } from '../helpers'
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

  // update account
  // retrieve the user
  let record = await AccountEntity.get(to.toString());
  if( record === undefined ){
    const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
    record = new AccountEntity(commonExtrinsicData.hash)
    record.id = to.toString();
  }

  await api.query.system.account(to, ({ data: balance }) => {
    record.capsAmount = (balance.free as Balance).toBigInt().toString();
    record.save()
  });

  // @ts-ignore
  await api.query.tiimeAccountStore.account(to, (balance) => {
    // @ts-ignore
    record.tiimeAmount = (balance.free as Balance).toBigInt().toString();
    record.save()
  });
  await record.save()

  // update account signer
  // retrieve the user
  let recordSigner = await AccountEntity.get(signer.toString());
  if( recordSigner === undefined ){
    const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
    recordSigner = new AccountEntity(commonExtrinsicData.hash)
    recordSigner.id = signer.toString();
  }
  await api.query.system.account(to, ({ data: balance }) => {
    record.capsAmount = (balance.free as Balance).toBigInt().toString();
    record.save()
  });


  // @ts-ignore
  await api.query.tiimeAccountStore.account(signer, (balance) => {
    // @ts-ignore
    recordSigner.tiimeAmount = balance.free.toString();
    recordSigner.save()
  });
  await recordSigner.save()
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
  // retrieve the user
  let record = await AccountEntity.get(to.toString());
  if( record === undefined ){
    const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
    record = new AccountEntity(commonExtrinsicData.hash)
    record.id = to.toString();
  }
  await api.query.system.account(to, ({ data: balance }) => {
    record.capsAmount = (balance.free as Balance).toBigInt().toString();
    record.save()
  });

  // @ts-ignore
  await api.query.tiimeAccountStore.account(to, (balance) => {
    // @ts-ignore
    record.tiimeAmount = balance.free.toString();
    record.save()
  });
  await record.save()

  // update account signer
  // retrieve the user
  let recordSigner = await AccountEntity.get(signer.toString());
  if( recordSigner === undefined ){
    const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
    recordSigner = new AccountEntity(commonExtrinsicData.hash)
    recordSigner.id = signer.toString();
  }
  await api.query.system.account(to, ({ data: balance }) => {
    recordSigner.capsAmount = (balance.free as Balance).toBigInt().toString();
    recordSigner.save()
  });


  // @ts-ignore
  await api.query.tiimeAccountStore.account(signer, (balance) => {
    // @ts-ignore
    recordSigner.tiimeAmount = balance.free.toString();
    recordSigner.save()
  });
  await recordSigner.save()

}
