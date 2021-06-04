import { AccountEntity } from "../types/models/AccountEntity";
import { getCommonExtrinsicData } from "./extrinsic";
import { Balance } from "@polkadot/types/interfaces";

export const updateAccount = async (user, call, extrinsic) => {
  // update account
  // retrieve the user
  let record = await AccountEntity.get(user.toString());

  if( record === undefined ){
    const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
    record = new AccountEntity(commonExtrinsicData.hash)
    record.id = user.toString();
  }

  await api.query.system.account(user, ({ data: balance })  =>  {
    record.capsAmount = (balance.free as Balance).toBigInt().toString();
  });
  await record.save();

  // @ts-ignore
  await api.query.tiimeAccountStore.account(user, (balance) => {
    // @ts-ignore
    record.tiimeAmount = (balance.free as Balance).toBigInt().toString();
    record.save()
  });
  await record.save();
}
