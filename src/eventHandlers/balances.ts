import { SubstrateEvent } from '@subql/types'
import { Codec } from "@polkadot/types/types";
import { Balance } from '@polkadot/types/interfaces';
import { updateAccount, getCommonEventData, roundPrice, CommonEventData } from '../helpers'
import { TransferEntity } from '../types';

export const transferHandler = async (event: SubstrateEvent): Promise<void> => {
    const commonEventData = getCommonEventData(event)
    const [from, to, amount] = event.event.data
    await genericTransferHandler(from, to, amount, commonEventData)
    await updateAccount(from.toString());
    await updateAccount(to.toString());
}

export const genericTransferHandler = async (
    from: Codec | string, 
    to: Codec | string,
    amount: Codec | string,
    commonEventData: CommonEventData
): Promise<void> => {
    const record = new TransferEntity(commonEventData.blockId + "-" + commonEventData.eventId)
    record.blockId = commonEventData.blockId
    record.blockHash = commonEventData.blockHash
    record.extrinsicId = commonEventData.extrinsicId
    record.isSuccess = commonEventData.isSuccess
    record.timestamp = commonEventData.timestamp
    record.from = from.toString()
    record.to = to.toString()
    record.currency = "CAPS"
    record.amount = !(typeof amount === "string") ? (amount as Balance).toBigInt().toString() : amount;
    record.amountRounded = roundPrice(record.amount)
    await record.save()
}