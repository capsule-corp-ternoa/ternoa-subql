import { AccountEntity } from "../types/models/AccountEntity";
import { Balance } from "@polkadot/types/interfaces";

export const updateAccount = async (user: string, call, extrinsic) => {
  try {
    const date = new Date()
    // retrieve the user
    let record = await AccountEntity.get(user);
    if( record === undefined ){
      record = new AccountEntity(user)
      record.createdAt = date
    }
    await api.query.system.account(user, ({ data: balance })  =>  {
      const balanceFrozenFee = balance.feeFrozen.toBigInt()
      const balanceFrozenMisc = balance.miscFrozen.toBigInt()
      const balanceReserved = balance.reserved.toBigInt()
      const balanceFree = balance.free.toBigInt()
      const frozen = balanceFrozenFee > balanceFrozenMisc ? balanceFrozenMisc : balanceFrozenMisc
      const total = balanceFree + balanceReserved
      const transferable = balanceFree - frozen
      record.capsAmount = transferable.toString();
      record.capsAmountFrozen = frozen.toString();
      record.capsAmountTotal = total.toString();
    });
    await api.query.tiimeAccountStore.account(user, async (balance: any) => {
      record.tiimeAmount = (balance.free as Balance).toBigInt().toString();
    });
    record.updatedAt = date
    await record.save();
  } catch (e) {
    logger.error(e.toString());
  }

}
