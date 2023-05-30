import { SubstrateExtrinsic } from "@subql/types"
import { formatString, updateAccounts } from "../helpers"
import { NftEntity } from "../types"
import { bulkCreatedNFTSideEffects, genericBulkCreate } from "../helpers/nfts"

const balanceMethods = ["BalanceSet", "Deposit", "DustLost", "Endowed", "Reserved", "Slashed", "Unreserved", "Withdraw"]
const nftMethods = ["NFTCreated", "NFTTransferred"]

export async function handleCall(extrinsic: SubstrateExtrinsic): Promise<void> {
  if (!extrinsic.success) {
    return
  }
  const signer = extrinsic.extrinsic.signer.toString()
  const events = extrinsic.events
  const addressStack: string[] = []
  // const nftCreationStack: Set<NftEntity[]> = new Set()
  const nftCreationStack: NftEntity[] = []
  const collectionUpdateStack: Map<string, string[]> = new Map()

  let nftMintFee: string
  for (const event of events) {
    const { data, method, section } = event.event
    const key = `${section}.${method}`
    try {
      //Handle Balances
      if (section === "balances" && balanceMethods.includes(method)) {
        logger.info(`handleCall - ${key}`)
        const [who] = data
        if (!addressStack.includes(who.toString()) && who.toString() !== signer) {
          addressStack.push(who.toString())
        }
      }

      //Handle NFT
      if (section === "nft" && method === nftMethods[0]) {
        logger.info(`handleCall - ${key}`)
        const [rawNftId, owner, offchainData, royalty, rawCollectionId, isSoulbound, mintFee] = data
        nftMintFee = mintFee.toString()
        const nftEvent = new Map()
        const nftId = rawNftId.toString()
        const collectionId = rawCollectionId?.toString()

        nftEvent.set("id", nftId)
        nftEvent.set("nftId", nftId)
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

        if (collectionId) {
          const nfts = collectionUpdateStack.get(collectionId)

          if (nfts) {
            if (!nfts.includes(nftId)) {
              nfts.push(nftId)
            }
          } else {
            collectionUpdateStack.set(collectionId, [nftId])
          }
          nftEvent.set("collectionId", collectionId)
        } else {
          nftEvent.set("collectionId", null)
        }

        if (!nftCreationStack.includes(nftEvent.get(nftId.toString()))) {
          nftCreationStack.push(Object.fromEntries(nftEvent))
        }
      }
    } catch (err) {
      logger.error("Error in handleCall " + key + " at block " + extrinsic.block.block.header.number.toString())
      logger.error("Error detail " + err)
      if (err.sql) logger.error("Error detail sql " + err.sql)
    }
  }

  if (addressStack.length > 0) await updateAccounts(addressStack)
  if (nftCreationStack.length > 0) {
    await genericBulkCreate("NftEntity", nftCreationStack)
    await bulkCreatedNFTSideEffects(nftCreationStack, collectionUpdateStack, extrinsic, nftMintFee)
  }
}
