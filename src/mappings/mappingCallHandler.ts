import { SubstrateExtrinsic } from "@subql/types"
import * as callHandlers from "../callHandlers"
import { checkIfAnyBatch, checkIfTransfer, updateAccounts } from "../helpers"

export async function handleCall(extrinsics: SubstrateExtrinsic): Promise<void> {
  const balanceMethods = [
    "BalanceSet",
    "Deposit",
    "DustLost",
    "Endowed",
    "Reserved",
    "Slashed",
    "Unreserved",
    "Withdraw",
  ]
  // hard to put logic here. Need to refacto both callHandler accounts + callHandler nfts as extrinsics.events need to be mapped.
  const key = `${extrinsics.events.event.section}.${extrinsics.events.event.method}`
  logger.info(key)
  try {
    switch (key) {
      case "balances.BalanceSet":
      case "balances.Deposit":
      case "balances.DustLost":
      case "balances.Endowed":
      case "balances.Reserved":
      case "balances.Slashed":
      case "balances.Unreserved":
      case "balances.Withdraw":
        await callHandlers.accountUpdateHandler(extrinsics)
        break
      case "nft.NFTCreated":
        await callHandlers.nftBatchHandler(extrinsics)
        break
    }
  } catch (err) {
    logger.error("Error in event " + key + " at block " + extrinsics.block.block.header.number.toString())
    logger.error("Error detail " + err)
    if (err.sql) logger.error("Error detail sql " + err.sql)
  }
}
