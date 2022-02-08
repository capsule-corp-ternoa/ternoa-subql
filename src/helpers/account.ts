import { AccountEntity } from "../types/models/AccountEntity";
import { roundPrice } from "../utils";

export const updateAccount = async (user: string) => {
  try {
    const date = new Date()
    // retrieve the user
    let record = await AccountEntity.get(user);
    if( record === undefined ){
      record = new AccountEntity(user)
      record.createdAt = date
    }
    await api.query.system.account(user, async ({ data: balance })  =>  {
      try{
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
        record.capsAmountRounded = roundPrice(record.capsAmount)
        record.capsAmountFrozenRounded = roundPrice(record.capsAmountFrozen)
        record.capsAmountTotalRounded = roundPrice(record.capsAmountTotal)
        record.updatedAt = date
        await record.save();
      }catch(err){
        logger.error(JSON.stringify(err))
      }
    });
  } catch (err) {
    logger.error(JSON.stringify(err))
  }
}
