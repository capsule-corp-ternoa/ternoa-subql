import { SubstrateExtrinsic } from "@subql/types"
import { CollectionEntity, NftEntity } from "../types"
import { checkIfBatch, checkIfBatchAll } from "./event"
import { NFTOperation, genericTransferHandler, nftOperationEntityHandler } from "../eventHandlers"
import { handlePromiseAllSettledErrors } from "./common"

export const bulkCreateNFT = async (nftList: NftEntity[]) => {
  if (!nftList.length) {
    throw new Error("Error at NFT bulk creation: Empty nftList")
  }
  try {
    await store.bulkCreate(`NftEntity`, nftList)
  } catch (err) {
    logger.error("Error at NFT bulk creation: " + err.toString())
    if (err.sql) logger.error("Error at NFT bulk creation: " + JSON.stringify(err.sql))
  }
}

export const bulkCreatedNFTSideEffects = async (
  nftList: NftEntity[],
  extrinsic: SubstrateExtrinsic,
  mintFee: string,
) => {
  if (!extrinsic.success) {
    throw new Error("bulk NFT side effects error, extrinsic success : false")
  }
  try {
    for (const nft of nftList) {
      const nftEvent = extrinsic.events.find(
        (x) =>
          x.event.section === "nft" && x.event.method === "NFTCreated" && x.event.data.toString().includes(nft.nftId),
      )
      const nftEventId =
        extrinsic.events.findIndex(
          (x) =>
            x.event.section === "nft" && x.event.method === "NFTCreated" && x.event.data.toString().includes(nft.nftId),
        ) + 1
      const block = extrinsic.block.block
      const commonEventData = {
        isSuccess: extrinsic.success,
        blockId: block.header.number.toString(),
        blockHash: block.hash.toString(),
        extrinsicId: nftEvent.phase.isApplyExtrinsic
          ? `${block.header.number.toString()}-${nftEvent.phase.asApplyExtrinsic.toString()}`
          : "",
        eventId: nftEventId.toString(),
        isBatch: checkIfBatch(extrinsic),
        isBatchAll: checkIfBatchAll(extrinsic),
        timestamp: extrinsic.block.timestamp,
      }

      const record = await NftEntity.get(nft.nftId.toString())
      if (record === undefined) throw new Error("NFT created from 'batch' not found in db")

      const promiseRes = await Promise.allSettled([
        (async () => {
          if (record.collectionId) {
            let collectionRecord = await CollectionEntity.get(record.collectionId)
            if (collectionRecord === undefined) throw new Error("Collection where nft is added not found in db")
            const newLength = collectionRecord.nfts.push(nft.nftId)
            collectionRecord.nbNfts = newLength
            if (newLength === collectionRecord.limit) collectionRecord.hasReachedLimit = true
            await collectionRecord.save()
          }
        })(),

        nftOperationEntityHandler(record, null, commonEventData, NFTOperation.Created, [mintFee.toString()]),
        genericTransferHandler(nft.owner, "Treasury", mintFee, commonEventData),
      ])
      handlePromiseAllSettledErrors(promiseRes, "in bulkCreatedNFTSideEffects")
    }
  } catch (err) {
    logger.error("Error at bulk NFT side effects update: " + err.toString())
    if (err.sql) logger.error("Error at bulk NFT side effects update: " + JSON.stringify(err.sql))
  }
}
