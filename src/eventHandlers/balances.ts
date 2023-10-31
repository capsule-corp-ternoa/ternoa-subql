import { SubstrateEvent } from "@subql/types"
import { Codec } from "@polkadot/types/types"
import { Balance } from "@polkadot/types/interfaces"
import { updateAccounts, getCommonEventData, roundPrice, CommonEventData, getSigner } from "../helpers"
import { TransferEntity } from "../types"

export const transferHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  const [from, to, amount] = event.event.data
  await genericTransferHandler(from, to, amount, commonEventData)
  await updateAccounts([to.toString()])
  const signer = event.extrinsic?.extrinsic.signer.toString()
  if (from.toString() !== signer) await updateAccounts([from.toString()])
}

export const genericTransferHandler = async (
  from: Codec | string,
  to: Codec | string,
  amount: Codec | string,
  commonEventData: CommonEventData,
): Promise<void> => {
  const { blockId, blockHash, eventId, extrinsicId, isSuccess, timestamp } = commonEventData

  const transferEntityId = blockId + "-" + eventId
  const currency = "CAPS"
  const formattedAmount = !(typeof amount === "string") ? (amount as Balance).toBigInt().toString() : amount
  const amountRounded = roundPrice(formattedAmount)
  const record = new TransferEntity(
    transferEntityId,
    blockId,
    blockHash,
    extrinsicId,
    isSuccess,
    timestamp,
    from.toString(),
    to.toString(),
    currency,
    formattedAmount,
    amountRounded,
  )
  await record.save()
}
