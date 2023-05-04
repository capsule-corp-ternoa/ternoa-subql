import { SubstrateExtrinsic } from "@subql/types"
import { CollectionEntity, NftEntity } from "../types"
import { checkIfBatch, checkIfBatchAll } from "./event"
import { NFTOperation, genericTransferHandler, nftOperationEntityHandler } from "../eventHandlers"
import { handlePromiseAllSettledErrors } from "./common"

export const bulckCreateNFT = async (nftList: NftEntity[]) => {
  try {
    await store.bulkCreate(`NftEntity`, nftList)
  } catch (err) {
    logger.error("Error at NFT bulck creation: " + err.toString())
    if (err.sql) logger.error("Error at NFT bulck creation: " + JSON.stringify(err.sql))
  }
}

export const bulckCreatedNFTSideEffects = async (
  nftList: NftEntity[],
  extrinsic: SubstrateExtrinsic,
  mintFee: string,
) => {
  try {
    if (!extrinsic.success) {
      throw new Error("Bulck NFT side effects error, extrinsic success : false")
    }

    for (const nft of nftList) {
      const nftEvent = extrinsic.events.filter(
        (x) =>
          x.event.section === "nft" && x.event.method === "NFTCreated" && x.event.data.toString().includes(nft.nftId),
      )[0]
      logger.info(JSON.stringify(nftEvent))
      const block = extrinsic.block.block

      const commonEventData = {
        isSuccess: extrinsic.success,
        blockId: block.header.number.toString(),
        blockHash: block.hash.toString(),
        extrinsicId: nftEvent.phase.isApplyExtrinsic
          ? `${block.header.number.toString()}-${nftEvent.phase.asApplyExtrinsic.toString()}`
          : "", //`${block.header.number.toString()}-${nftEvent.event.index.toString()}`,
        eventId: nftEvent.event.index.toString(),
        isBatch: checkIfBatch(extrinsic),
        isBatchAll: checkIfBatchAll(extrinsic),
        timestamp:extrinsic.block.timestamp, //nft.timestampCreated //all extrinsics have the same timestamp in a batch ?
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
        //issue because commonEventData are the same
        genericTransferHandler(nft.owner, "Treasury", mintFee, commonEventData),
      ])
      handlePromiseAllSettledErrors(promiseRes, "in bulckCreatedNFTSideEffects")
    }
  } catch (err) {
    logger.error("Error at Bulck NFT side effects update: " + err.toString())
    if (err.sql) logger.error("Error at Bulck NFT side effects update: " + JSON.stringify(err.sql))
  }
}
