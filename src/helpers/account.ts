import { roundPrice } from "../helpers"
import { AccountData } from "../genericTypes"
import { AccountEntity } from "../types"

export const updateAccounts = async (addresses: string[]) => {
  try {
    const res = await api.query.system.account.multi(addresses) as any
    await Promise.all(
      res.map(async ({ data: balance }: { data: AccountData }, idx: number) => {
        if (balance) {
          const { free, reserved, frozen, miscFrozen, feeFrozen } = balance
          const address = addresses[idx]
          const date = new Date()

          let balanceFrozen: bigint | undefined = undefined

          if (frozen) {
            balanceFrozen = frozen.toBigInt()
          } else {
            if (miscFrozen && feeFrozen) {
              const balanceFrozenMisc = miscFrozen.toBigInt()
              const balanceFrozenFee = feeFrozen.toBigInt()
              balanceFrozen = balanceFrozenFee > balanceFrozenMisc ? balanceFrozenFee : balanceFrozenMisc
            } else if (miscFrozen) {
              balanceFrozen = miscFrozen.toBigInt()
            } else if (feeFrozen) {
              balanceFrozen = feeFrozen.toBigInt()
            }
          }

          const balanceFree = free.toBigInt()
          const balanceReserved = reserved.toBigInt()

          const capsAmount = (balanceFree - balanceFrozen).toString()
          const capsAmountFrozen = balanceFrozen.toString()
          const capsAmountTotal = (balanceFree + balanceReserved).toString()

          let record = await AccountEntity.get(address)
          if (record === undefined) {
            record = new AccountEntity(address)
            record.createdAt = date
          }
          record.capsAmount = capsAmount
          record.capsAmountFrozen = capsAmountFrozen
          record.capsAmountTotal = capsAmountTotal
          record.capsAmountRounded = roundPrice(record.capsAmount)
          record.capsAmountFrozenRounded = roundPrice(record.capsAmountFrozen)
          record.capsAmountTotalRounded = roundPrice(record.capsAmountTotal)
          record.updatedAt = date
          await record.save()
        } else {
          logger.error("Error in update accout : Balance not found")
        }
      }),
    )
  } catch (err) {
    logger.error("Error in update accout : " + err.toString())
    if (err.sql) logger.error("Error in update accout : " + JSON.stringify(err.sql))
  }
}