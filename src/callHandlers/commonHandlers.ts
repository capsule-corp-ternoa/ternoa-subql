import { SubstrateExtrinsic } from "@subql/types"
import { formatString, handlePromiseAllSettledErrors, updateAccounts } from "../helpers"
import { NftEntity } from "../types"
import { bulckCreateNFT, bulckCreatedNFTSideEffects } from "../helpers/nfts"

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

  let nftMintFee: string
  for (const event of events) {
    const { data, method, section } = event.event
    const key = `${section}.${method}`
    try {
      //Handle Balances
      try {
        if (section === "balances" && balanceMethods.includes(method)) {
          logger.info(`handleCall - ${key}`)
          const [who] = data
          if (!addressStack.includes(who.toString()) && who.toString() !== signer) {
            addressStack.push(who.toString())
          }
        }
      } catch (err) {
        logger.error("Error while handeling batch Balances queues: " + err.toString())
      }

      //Handle NFT
      try {
        if (section === "nft" && method === nftMethods[0]) {
          logger.info(`handleCall - ${key}`)
          const [nftId, owner, offchainData, royalty, collectionId, isSoulbound, mintFee] = data
          nftMintFee = mintFee.toString()
          const nftEvent = new Map()
          nftEvent.set("id", nftId.toString())
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
      } catch (err) {
        logger.error("Error while handeling batch NFT queues: " + err.toString())
      }
    } catch (err) {
      logger.error("Error in handleCall " + key + " at block " + extrinsic.block.block.header.number.toString())
      logger.error("Error detail " + err)
      if (err.sql) logger.error("Error detail sql " + err.sql)
    }
  }

  const promiseRes = await Promise.allSettled([
    addressStack.length && (await updateAccounts(addressStack)),
    nftCreationStack.length && (await bulckCreateNFT(nftCreationStack)),
  ])
  handlePromiseAllSettledErrors(promiseRes, "in handleCall Handler")
  await bulckCreatedNFTSideEffects(nftCreationStack, extrinsic, nftMintFee)
}
