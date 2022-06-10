import { SubstrateEvent } from "@subql/types"
import { getCommonEventData, formatString, roundPrice } from "../helpers"
import { CollectionEntity, NftEntity } from "../types"
import { genericTransferHandler, nftOperationEntityHandler } from "."

export const nftCreatedHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess) throw new Error("NFT created error, extrinsic isSuccess : false")
  const [nftId, owner, offchainData, royalty, collectionId, isSoulbound, mintFee] = event.event.data
  let record = await NftEntity.get(nftId.toString())
  if (record === undefined) {
    record = new NftEntity(nftId.toString())
    const date = new Date()
    record.nftId = nftId.toString()
    record.collectionId = collectionId ? collectionId.toString() : null
    record.owner = owner.toString()
    record.creator = owner.toString()
    record.offchainData = offchainData.toString()
    record.royalty = Number(royalty) / 10000
    record.mintFee = mintFee.toString()
    record.mintFeeRounded = roundPrice(record.mintFee)
    record.isCapsule = false
    record.listedForSale = false
    record.isSecret = false
    record.isDelegated = false
    record.isSoulbound = isSoulbound.toString() === 'true'
    record.createdAt = date
    record.updatedAt = date
    record.timestampCreate = commonEventData.timestamp
    await record.save()
    if (record.collectionId) {
      let collectionRecord = await CollectionEntity.get(record.collectionId)
      collectionRecord.nfts.push(record.nftId)
      await collectionRecord.save()
    }
    await nftOperationEntityHandler(record, "null address", commonEventData, "creation")
    await genericTransferHandler(owner, "Treasury", mintFee, commonEventData)
  }
}

export const nftBurnedHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess) throw new Error("NFT burned error, extrinsic isSuccess : false")
  const [nftId] = event.event.data
  const date = new Date()
  const record = await NftEntity.get(nftId.toString())
  if (record === undefined) throw new Error("NFT to burn not found in db")
  const oldOwner = record.owner
  record.owner = "null address"
  record.timestampBurn = commonEventData.timestamp
  record.updatedAt = date
  await record.save()
  await nftOperationEntityHandler(record, oldOwner, commonEventData, "burn")
}

export const nftTransferHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess) throw new Error("NFT transfered error, extrinsic isSuccess : false")
  const [nftId, from, to] = event.event.data
  const date = new Date()
  const record = await NftEntity.get(nftId.toString())
  if (record === undefined) throw new Error("NFT to transfer not found in db")
  record.owner = to.toString()
  record.updatedAt = date
  await record.save()
  await nftOperationEntityHandler(record, from.toString(), commonEventData, "transfer")
}

export const nftDelegatedHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess) throw new Error("NFT delegated error, extrinsic isSuccess : false")
  const [id, recipient] = event.event.data
  const date = new Date()
  let record = await NftEntity.get(id.toString())
  if (record === undefined) throw new Error("NFT to delegate not found in db")
  const oldOwner = record.owner
  record.delegatee = recipient?.toString() || null;
  record.isDelegated = record.delegatee ? true : false; 
  record.updatedAt = date
  await record.save()
  await nftOperationEntityHandler(record, oldOwner, commonEventData, "delegate")
}

export const nftRoyaltySetHandler = async (event: SubstrateEvent): Promise<void> => {
	const commonEventData = getCommonEventData(event)
	if (!commonEventData.isSuccess) throw new Error("NFT royalty set error, extrinsic isSuccess : false")
	const [id, royalty] = event.event.data
	const date = new Date()
	let record = await NftEntity.get(id.toString())
	if (record === undefined) throw new Error("NFT to set royalty not found in db")
	record.royalty = Number(royalty) / 10000 //premill or number
	record.updatedAt = date
	await record.save() 
	//check if nftOperationEntityHandler must be recorded for nft attribute update as Royaltyset.
}
