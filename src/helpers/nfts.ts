import { SubstrateExtrinsic } from "@subql/types"
import { CollectionEntity, NftEntity } from "../types"
// import { getCommonEventData } from "./event"
// import { NFTOperation, genericTransferHandler, nftOperationEntityHandler } from "../eventHandlers"

export const bulckCreateNFTHandler = async (nftList: NftEntity[]) => {
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
      //return ? better 
      throw new Error("NFT Record error, extrinsic success : false")
    }

    for (const nft of nftList) {
      const record = new NftEntity(nft.nftId.toString())
      if (record === undefined) throw new Error("NFT created from 'batch' not found in db")
      await Promise.allSettled([
        (async () => {
          if (record.collectionId.toString()) {
            let collectionRecord = await CollectionEntity.get(record.collectionId.toString())
            if (collectionRecord === undefined) throw new Error("Collection where nft is added not found in db")
            const newLength = collectionRecord.nfts.push(nft.nftId.toString())
            collectionRecord.nbNfts = newLength
            if (newLength === collectionRecord.limit) collectionRecord.hasReachedLimit = true
            await collectionRecord.save()
          }
        })(),
        //Need to refacto the commonEventData to accept SubstrateEvent
        //nftOperationEntityHandler(record, null, commonEventData, NFTOperation.Created, [mintFee.toString()]),
        //genericTransferHandler(nft.owner, "Treasury", mintFee, commonEventData),
      ])
    }
  } catch (err) {
    logger.error("Error at NFT bulck creation: " + err.toString())
    if (err.sql) logger.error("Error at NFT bulck creation: " + JSON.stringify(err.sql))
  }
}
