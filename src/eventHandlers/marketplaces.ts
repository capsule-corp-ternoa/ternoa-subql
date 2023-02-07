import { SubstrateEvent } from "@subql/types"
import { IFeeType } from "ternoa-js/marketplace/types"

import { RequireOnlyOne } from "../genericTypes"
import { getCommonEventData, roundPrice } from "../helpers"
import { parseConfigSetFee, parseList, parseOffchainData } from "../helpers/marketplace"
import { MarketplaceEntity, NftEntity } from "../types"

import { genericTransferHandler } from "./balances"
import { nftOperationEntityHandler, NFTOperation } from "./nftOperations"
import { TypeOfListing } from "./nfts"

// type CommissionType = "flat" | "percentage"
export const marketplaceCreatedHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess) throw new Error("Marketplace created error, extrinsic isSuccess : false")
  const [marketplaceId, owner, kind] = event.event.data
  const fee = await api.query.marketplace.marketplaceMintFee()
  let record = await MarketplaceEntity.get(marketplaceId.toString())
  if (record === undefined) {
    record = new MarketplaceEntity(marketplaceId.toString())
    record.marketplaceId = marketplaceId.toString()
    record.owner = owner.toString()
    record.kind = kind.toString()
    record.createdAt = commonEventData.timestamp
    record.updatedAt = commonEventData.timestamp
    record.timestampCreated = commonEventData.timestamp
    await record.save()
    await genericTransferHandler(owner, "Treasury", fee.toString(), commonEventData)
  }
}

export const marketplaceConfigSetHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess) throw new Error("Marketplace config set error, extrinsic isSuccess : false")
  const [marketplaceId, commissionFee, listingFee, accountList, offchainData, collectionList] = event.event.data
  const record = await MarketplaceEntity.get(marketplaceId.toString())
  if (record === undefined) throw new Error("Marketplace not found in db")
  const rawCommissionFee = commissionFee.toJSON() as { [key: string]: RequireOnlyOne<IFeeType> | null }
  const rawListingFee = listingFee.toJSON() as { [key: string]: RequireOnlyOne<IFeeType> | null }
  const rawAccountList = accountList.toJSON() as { [key: string]: string[] | null }
  const rawCollectionList = collectionList.toJSON() as { [key: string]: string[] | null }
  const rawOffchainData = offchainData.toJSON() as { [key: string]: string | null }

  parseConfigSetFee(record, "commission", rawCommissionFee)
  parseConfigSetFee(record, "listing", rawListingFee)
  parseList(record, "account", rawAccountList)
  parseList(record, "collection", rawCollectionList)
  parseOffchainData(record, rawOffchainData)

  record.updatedAt = commonEventData.timestamp
  await record.save()
}

export const marketplaceOwnerSetHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess) throw new Error("Marketplace owner set error, extrinsic isSuccess : false")
  const [marketplaceId, owner] = event.event.data
  const record = await MarketplaceEntity.get(marketplaceId.toString())
  if (record === undefined) throw new Error("Marketplace not found in db")
  record.owner = owner.toString()
  record.updatedAt = commonEventData.timestamp
  await record.save()
}

export const marketplaceKindSetHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess) throw new Error("Marketplace kind set error, extrinsic isSuccess : false")
  const [marketplaceId, kind] = event.event.data
  const record = await MarketplaceEntity.get(marketplaceId.toString())
  if (record === undefined) throw new Error("Marketplace not found in db")
  record.kind = kind.toString()
  record.updatedAt = commonEventData.timestamp
  await record.save()
}

export const nftListedHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess) throw new Error("Marketplace nft listed error, extrinsic isSuccess : false")
  const [nftId, marketplaceId, price] = event.event.data

  const record = await NftEntity.get(nftId.toString())
  if (record === undefined) throw new Error("NFT not found in db")
  record.isListed = true
  record.typeOfListing = TypeOfListing.Sale
  record.marketplaceId = marketplaceId.toString()
  record.price = price.toString()
  record.priceRounded = roundPrice(record.price)
  record.timestampListed = commonEventData.timestamp
  record.updatedAt = commonEventData.timestamp
  await record.save()
  await nftOperationEntityHandler(record, record.owner, commonEventData, NFTOperation.Listed)
}

export const nftUnlistedHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess) throw new Error("Marketplace nft unlisted error, extrinsic isSuccess : false")
  const [nftId] = event.event.data
  const record = await NftEntity.get(nftId.toString())
  if (record === undefined) throw new Error("NFT not found in db")
  record.isListed = false
  record.typeOfListing = null
  record.marketplaceId = null
  record.price = null
  record.priceRounded = null
  record.timestampListed = null
  record.updatedAt = commonEventData.timestamp
  await record.save()
  await nftOperationEntityHandler(record, record.owner, commonEventData, NFTOperation.Unlisted)
}

export const nftSoldHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess) throw new Error("Marketplace nft listed error, extrinsic isSuccess : false")
  const [nftId, marketplaceId, buyer, listedPrice, marketplaceCut, royaltyCut] = event.event.data
  const record = await NftEntity.get(nftId.toString())
  if (record === undefined) throw new Error("NFT not found in db")
  const seller = record.owner
  record.owner = buyer.toString()
  record.isListed = false
  record.typeOfListing = null
  record.marketplaceId = null
  record.price = null
  record.priceRounded = null
  record.timestampListed = null
  record.updatedAt = commonEventData.timestamp
  await record.save()
  await nftOperationEntityHandler(record, seller, commonEventData, NFTOperation.Sold, [
    marketplaceId.toString(),
    listedPrice.toString(),
    marketplaceCut.toString(),
    royaltyCut.toString(),
  ])
}
