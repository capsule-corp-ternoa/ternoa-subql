import { SubstrateEvent } from "@subql/types";
import { formatString, getCommonEventData } from "../helpers";
import { AssociatedAccountEntity } from "../types";

export const usernameChangedHandler = async (event: SubstrateEvent): Promise<void> => {
    const commonEventData = getCommonEventData(event)
    if (!commonEventData.isSuccess) throw new Error("username changed error, extrinsic isSuccess : false")
    const [account, key, value] = event.event.data;
    const date = new Date()
    let record = await AssociatedAccountEntity.get(account.toString())
    if (!record){
        record = new AssociatedAccountEntity(account.toString())
        record.accountName = []
        record.accountValue = []
        record.createdAt = date
    }
    const indexesToDelete:number[] = record.accountName.reduce(function(arr, element, index) {
        if (element === formatString(key.toString())) arr.push(index);
        return arr;
    }, []);
    record.accountName = record.accountName.filter((_x,i) => !indexesToDelete.includes(i))
    record.accountValue = record.accountValue.filter((_x,i) => !indexesToDelete.includes(i))
    if (value && value.toString().length > 0){
        record.accountName.push(formatString(key.toString()))
        record.accountValue.push(formatString(value.toString()))
    }
    record.updatedAt = date
    await record.save()
}