import { SubstrateEvent } from "@subql/types"
import { formatString, getCommonEventData } from "../helpers"
import { genericTransferHandler } from "./balances"
import { MarketplaceEntity } from "../types"

export const marketplaceCreatedHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess) throw new Error("Marketplace created error, extrinsic isSuccess : false")
  const [marketplaceId, owner, kind, commissionFee, listingFee, offchainData] = event.event.data
  const fee = await api.query.marketplace.marketplaceMintFee()
  let record = await MarketplaceEntity.get(marketplaceId.toString())
  if (record === undefined) {
    const date = new Date()
    record = new MarketplaceEntity(marketplaceId.toString())
    record.marketplaceId = marketplaceId.toString()
    record.owner = owner.toString()
    record.kind = kind.toString()
    if (commissionFee) record.commissionFee = commissionFee.toString()
    if (listingFee) record.listingFee = listingFee.toString()
    record.accountList = []
    if (offchainData) record.offchainData = formatString(offchainData.toString())
    record.createdAt = date
    record.updatedAt = date
    await record.save()
    await genericTransferHandler(owner, "Treasury", fee, commonEventData)
  }
}

export const marketplaceOwnerSetHandler = async (event: SubstrateEvent): Promise<void> => {
  //todo
}

export const marketplaceKindSetHandler = async (event: SubstrateEvent): Promise<void> => {
  //todo
}

export const marketplaceConfigSetHandler = async (event: SubstrateEvent): Promise<void> => {
  //todo
}

export const marketplaceMintFeeSetHandler = async (event: SubstrateEvent): Promise<void> => {
  //todo
}

export const nftListedHandler = async (event: SubstrateEvent): Promise<void> => {
  //todo
}

export const nftUnlistedHandler = async (event: SubstrateEvent): Promise<void> => {
  //todo
}

export const nftSoldHandler = async (event: SubstrateEvent): Promise<void> => {
  //todo
}
