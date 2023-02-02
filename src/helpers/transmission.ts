import { TransmissionEntity } from "../types"

export const getLastTransmission = async (nftId: string): Promise<TransmissionEntity | undefined> => {
  let records = await TransmissionEntity.getByNftId(nftId)
  records = records.filter(({ timestampRemoved }) => timestampRemoved === null)
  if (records.length === 0) return undefined
  return records.sort((a, b) => +a.timestampCreated - +b.timestampCreated)[0]
}
