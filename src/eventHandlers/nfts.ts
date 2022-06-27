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
    record.offchainData = formatString(offchainData.toString())
    record.royalty = String(Number(royalty.toString()) / 10000)
    record.mintFee = mintFee.toString()
    record.mintFeeRounded = roundPrice(record.mintFee)
    record.isCapsule = false
    record.listedForSale = false
    record.isSecret = false
    record.isDelegated = false
    record.isSoulbound = isSoulbound.toString() === "true"
    record.createdAt = date
    record.updatedAt = date
    record.timestampCreate = commonEventData.timestamp
    await record.save()
    if (record.collectionId) {
      let collectionRecord = await CollectionEntity.get(record.collectionId)
      if (collectionRecord === undefined) throw new Error("Collection where nft is added not found in db")
      collectionRecord.nfts.push(record.nftId)
      await collectionRecord.save()
    }
    await nftOperationEntityHandler(record, "null address", commonEventData, "create")
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
  record.delegatee = recipient?.toString() || null
  record.isDelegated = record.delegatee ? true : false
  record.updatedAt = date
  await record.save()
  await nftOperationEntityHandler(record, record.owner, commonEventData, "delegate")
}

export const nftRoyaltySetHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess) throw new Error("NFT royalty set error, extrinsic isSuccess : false")
  const [id, royalty] = event.event.data
  const date = new Date()
  let record = await NftEntity.get(id.toString())
  if (record === undefined) throw new Error("NFT to set royalty not found in db")
  record.royalty = String(Number(royalty.toString()) / 10000)
  record.updatedAt = date
  await record.save()
  await nftOperationEntityHandler(record, record.owner, commonEventData, "setRoyalty")
}

export const nftCollectionCreatedHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess) throw new Error("NFT collection creation error, extrinsic isSuccess : false")
  const [collectionId, owner, offchainData, limit] = event.event.data
  let record = await CollectionEntity.get(collectionId.toString())
  if (record === undefined) {
    record = new CollectionEntity(collectionId.toString())
    record.collectionId = collectionId.toString()
    record.isClosed = false
    record.limit = limit ? Number(limit.toString()) : null //collectionSizeLimit: 1,000,000
    record.nfts = null
    record.owner = owner.toString()
    record.offchainData = formatString(offchainData.toString())
    record.timestampCreate = commonEventData.timestamp
    await record.save()
  }
}

export const nftCollectionBurnedHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess) throw new Error("NFT collection burn error, extrinsic isSuccess : false")
  const [collectionId] = event.event.data
  const record = await CollectionEntity.get(collectionId.toString())
  if (record === undefined) throw new Error("NFT collection to burn not found in db")
  record.owner = "null address"
  record.timestampBurn = commonEventData.timestamp
  await record.save()
}

export const nftCollectionClosedHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess) throw new Error("NFT collection closing error, extrinsic isSuccess : false")
  const [collectionId] = event.event.data
  const record = await CollectionEntity.get(collectionId.toString())
  if (record === undefined) throw new Error("NFT collection to close not found in db")
  record.isClosed = true
  record.timestampClose = commonEventData.timestamp
  await record.save()
}

export const nftCollectionLimitedHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess) throw new Error("NFT collection limit set error, extrinsic isSuccess : false")
  const [collectionId, limit] = event.event.data
  const record = await CollectionEntity.get(collectionId.toString())
  if (record === undefined) throw new Error("NFT collection to set limit not found in db")
  record.limit = Number(limit.toString())
  record.timestampLimit = commonEventData.timestamp
  await record.save()
}

export const nftAddedToCollectionHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess) throw new Error("NFT add to collection error, extrinsic isSuccess : false")
  const [nftId, collectionId] = event.event.data
  const collectionRecord = await CollectionEntity.get(collectionId.toString())
  const nftRecord = await NftEntity.get(nftId.toString())
  if (collectionRecord === undefined) throw new Error("Collection where nft is added not found in db")
  if (nftRecord === undefined) throw new Error("NFT not found in db")
  if(nftRecord.collectionId) throw new Error("NFT already contains a collection")
  if (collectionRecord.nfts) collectionRecord.nfts.push(nftId.toString())
  else collectionRecord.nfts = [nftId.toString()]
  nftRecord.collectionId = collectionId.toString()
  await collectionRecord.save()
  await nftRecord.save()
  await nftOperationEntityHandler(nftRecord, collectionRecord.owner, commonEventData, "addNftToCollection")
}
