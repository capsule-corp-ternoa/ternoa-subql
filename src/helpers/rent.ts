import { RentEntity } from "../types"

export const getLastRentContract = async (nftId: string): Promise<RentEntity | undefined> => {
    let records = await RentEntity.getByNftId(nftId)
    records = records.filter(x=> !x.hasEnded && !x.isExpired)
    if (records.length === 0) return undefined
    return records.sort((a, b) => +a.timestampCreate - +b.timestampCreate)[0]
}
