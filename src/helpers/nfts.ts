import { SubstrateExtrinsic } from "@subql/types"
import { CollectionEntity, NftEntity, NftOperationEntity } from "../types"
import { NFTOperation } from "../eventHandlers"
import { roundPrice } from "./common"

export const genericBulkCreate = async (entity: string, list: any) => {
  if (!list.length) {
    throw new Error("Error at bulk creation: Empty list")
  }
  try {
    await store.bulkCreate(entity, list)
  } catch (err) {
    logger.error("Error at bulk creation: " + err.toString())
    if (err.sql) logger.error("Error at bulk creation: " + JSON.stringify(err.sql))
  }
}

export const bulkCreatedNFTSideEffects = async (
  nftList: NftEntity[],
  collectionUpdateStack: Map<string, string[]>,
  extrinsic: SubstrateExtrinsic,
  mintFee: string,
) => {
  if (!extrinsic.success) {
    throw new Error("bulk NFT side effects error, extrinsic success : false")
  }
  const nftOperationsStack: NftOperationEntity[] = []
  try {
    for (const nft of nftList) {
      const operation = new Map()
      const nftEvent = extrinsic.events.find(
        (x) =>
          x.event.section === "nft" && x.event.method === "NFTCreated" && x.event.data.toString().includes(nft.nftId),
      )
      const nftEventId =
        extrinsic.events.findIndex(
          (x) =>
            x.event.section === "nft" && x.event.method === "NFTCreated" && x.event.data.toString().includes(nft.nftId),
        ) + 1

      const { collectionId, nftId, owner, royalty } = nft
      const block = extrinsic.block.block
      const blockId = block.header.number.toString()
      const blockHash = block.hash.toString()
      const extrinsicId = nftEvent.phase.isApplyExtrinsic
        ? `${block.header.number.toString()}-${nftEvent.phase.asApplyExtrinsic.toString()}`
        : ""
      const timestamp = extrinsic.block.timestamp

      operation.set("id", blockHash + "-" + nftEventId + "-" + NFTOperation.Created)
      operation.set("blockId", blockId)
      operation.set("extrinsicId", extrinsicId)
      operation.set("nftId", nftId)
      operation.set("royalty", royalty)
      operation.set("collectionId", collectionId)
      operation.set("from", null)
      operation.set("to", owner)
      operation.set("price", mintFee)
      operation.set("priceRounded", roundPrice(mintFee))
      operation.set("typeOfTransaction", NFTOperation.Created)
      operation.set("timestamp", timestamp)

      nftOperationsStack.push(Object.fromEntries(operation))
    }

    for (let [collectionId, nfts] of collectionUpdateStack) {
      let collectionRecord = await CollectionEntity.get(collectionId)
      if (collectionRecord === undefined) throw new Error("Collection where nft is added not found in db")
      const collectionLength = nfts.length
      collectionRecord.nfts = nfts
      collectionRecord.nbNfts = collectionLength
      if (collectionLength === collectionRecord.limit) collectionRecord.hasReachedLimit = true
      await collectionRecord.save()
    }

    await genericBulkCreate("NftOperationEntity", nftOperationsStack)
  } catch (err) {
    logger.error("Error at bulk NFT side effects update: " + err.toString())
    if (err.sql) logger.error("Error at bulk NFT side effects update: " + JSON.stringify(err.sql))
  }
}
