import { AuctionEntity } from "../types"

export const getLastAuction = async (nftId: string): Promise<AuctionEntity | undefined> => {
  let records = await AuctionEntity.getByNftId(nftId)
  records = records.filter(({ isCancelled, isCompleted }) => !isCompleted && !isCancelled)
  if (records.length === 0) return undefined
  return records.sort((a, b) => b.timestampCreated.getTime() - a.timestampCreated.getTime())[0]
}
