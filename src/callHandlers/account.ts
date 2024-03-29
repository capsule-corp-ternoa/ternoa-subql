import { SubstrateExtrinsic } from "@subql/types"
import { updateAccounts } from "../helpers"

const balanceMethods = ["BalanceSet", "Deposit", "DustLost", "Endowed", "Reserved", "Slashed", "Unreserved", "Withdraw"]

export async function accountUpdateHandler(extrinsic: SubstrateExtrinsic): Promise<void> {
  if (!extrinsic.success) {
    return
  }

  const signer = extrinsic.extrinsic.signer.toString()
  const events = extrinsic.events

  const addressStack: string[] = []

  for (const event of events) {
    const { data, method, section } = event.event
    if (section === "balances" && balanceMethods.includes(method)) {
      const [who] = data
      if (!addressStack.includes(who.toString()) && who.toString() !== signer) {
        addressStack.push(who.toString())
      }
    }
  }

  await updateAccounts(addressStack)
}
