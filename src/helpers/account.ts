import { AccountEntity } from "../types/models/AccountEntity"
import { roundPrice } from "../helpers"

export const updateAccount = async (user: string) => {
  try {
    const res: any = await api.query.system.account(user)
    const balance = res.data
    if (balance) {
      const { feeFrozen, free, miscFrozen, reserved } = balance
      const date = new Date()
      let record = await AccountEntity.get(user)
      if (record === undefined) {
        record = new AccountEntity(user)
        record.createdAt = date
      }
      const balanceFrozenFee = feeFrozen.toBigInt()
      const balanceFrozenMisc = miscFrozen.toBigInt()
      const balanceReserved = reserved.toBigInt()
      const balanceFree = free.toBigInt()
      const frozen = balanceFrozenFee > balanceFrozenMisc ? balanceFrozenMisc : balanceFrozenMisc
      const total = balanceFree + balanceReserved
      const transferable = balanceFree - frozen
      record.capsAmount = transferable.toString()
      record.capsAmountFrozen = frozen.toString()
      record.capsAmountTotal = total.toString()
      record.capsAmountRounded = roundPrice(record.capsAmount)
      record.capsAmountFrozenRounded = roundPrice(record.capsAmountFrozen)
      record.capsAmountTotalRounded = roundPrice(record.capsAmountTotal)
      record.updatedAt = date
      await record.save()
    } else {
      logger.error("Error in update accout : Balance not found")
    }
  } catch (err) {
    logger.error("Error in update accout : " + err.toString())
    if (err.sql) logger.error("Error in update accout : " + JSON.stringify(err.sql))
  }
}
