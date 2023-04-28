import { SubstrateExtrinsic } from "@subql/types"
import { NftEntity } from "../types"
import { formatString } from "../helpers"
import { bulckCreateNFTHandler, bulckCreatedNFTSideEffects } from "../helpers/nfts"

const nftMethods = ["NFTCreated"] //"NFTTransferred"

export async function nftBatchHandler(extrinsic: SubstrateExtrinsic): Promise<void> {
  if (!extrinsic.success) {
    return
  }

  const events = extrinsic.events
  // const nftCreationStack: Set<NftEntity[]> = new Set()
  const nftCreationStack: NftEntity[] = []
  let nftMintFee: string 
  try {
    for (const event of events) {
      const { data, method, section } = event.event
      if (section === "nft" && method === nftMethods[0]) {
        const [nftId, owner, offchainData, royalty, collectionId, isSoulbound, mintFee] = data
        nftMintFee = mintFee.toString()
        const nftEvent = new Map()
        nftEvent.set("nftId", nftId.toString())
        nftEvent.set("collectionId", collectionId?.toString() || null)
        nftEvent.set("owner", owner.toString())
        nftEvent.set("creator", owner.toString())
        nftEvent.set("offchainData", formatString(offchainData.toString()))
        nftEvent.set("royalty", Number(royalty.toString()) / 10000)
        nftEvent.set("isCapsule", false)
        nftEvent.set("isListed", false)
        nftEvent.set("typeOfListing", null)
        nftEvent.set("isSecret", false)
        nftEvent.set("isRented", false)
        nftEvent.set("isDelegated", false)
        nftEvent.set("isSoulbound", isSoulbound.toString() === "true")
        nftEvent.set("isSecretSynced", false)
        nftEvent.set("isCapsuleSynced", false)
        nftEvent.set("isTransmission", false)
        nftEvent.set("createdAt", extrinsic.block.timestamp)
        nftEvent.set("updatedAt", extrinsic.block.timestamp)
        nftEvent.set("timestampCreated", extrinsic.block.timestamp)
        // when using a new Set l.14
        // if (!nftCreationStack.has(nftEvent.get(nftId.toString()))) {
        //   nftCreationStack.add(Object.fromEntries(nftEvent))
        // }
        if (!nftCreationStack.includes(nftEvent.get(nftId.toString()))) {
          nftCreationStack.push(Object.fromEntries(nftEvent))
        }
      }
    }
  } catch (err) {
    logger.error("Error while handeling batch NFT queues: " + err.toString())
  }
  await bulckCreateNFTHandler(nftCreationStack)
  await bulckCreatedNFTSideEffects(nftCreationStack, extrinsic, nftMintFee)
}
