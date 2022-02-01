import { SubstrateEvent } from "@subql/types";
import { formatString, getCommonEventData } from "../helpers";
import { AssociatedAccountEntity } from "../types";

export const altVRUsernameChangedHandler = async (event: SubstrateEvent): Promise<void> => {
    const commonEventData = getCommonEventData(event)
    if (!commonEventData.isSuccess) throw new Error("AltVR username changed error, extrinsic isSuccess : false")
    const [account, altVRName] = event.event.data;
    const accountName = "AltVR"
    const date = new Date()
    let record = await AssociatedAccountEntity.get(account.toString())
    if (!record){
        record = new AssociatedAccountEntity(account.toString())
        record.accountName = []
        record.accountValue = []
        record.createdAt = date
    }
    const indexesToDelete:number[] = record.accountName.reduce(function(arr, element, index) {
        if (element === accountName) arr.push(index);
        return arr;
    }, []);
    record.accountName = record.accountName.filter((_x,i) => !indexesToDelete.includes(i))
    record.accountValue = record.accountValue.filter((_x,i) => !indexesToDelete.includes(i))
    const accountValue = formatString(altVRName.toString())
    record.accountName.push(accountName)
    record.accountValue.push(accountValue)
    record.updatedAt = date
    await record.save()
}