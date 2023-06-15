import type { AccountInfo } from "@polkadot/types/interfaces"

import { roundPrice } from "../helpers"
import { AccountEntity } from "../types"

export const updateAccounts = async (addresses: string[]) => {
  try {
    const res = await api.query.system.account.multi<AccountInfo>(addresses)
    await Promise.all(
      res.map(async ({ data: balance }, idx) => {
        if (balance) {
          const { feeFrozen, free, miscFrozen, reserved } = balance
          const address = addresses[idx]
          const date = new Date()
          const balanceFrozenMisc = miscFrozen.toBigInt()
          const balanceFrozenFee = feeFrozen.toBigInt()
          const balanceFrozen = balanceFrozenFee > balanceFrozenMisc ? balanceFrozenFee : balanceFrozenMisc
          const balanceReserved = reserved.toBigInt()
          const balanceFree = free.toBigInt()
          const capsAmountFrozen = balanceFrozen.toString()
          const capsAmountTotal = (balanceFree + balanceReserved).toString()
          const capsAmount = (balanceFree - balanceFrozen).toString()
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
