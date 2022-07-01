import { SubstrateEvent } from "@subql/types"
import { formatString, getCommonEventData, roundPrice } from "../helpers"
import { genericTransferHandler } from "./balances"
import { MarketplaceEntity, NftEntity } from "../types"
import { nftOperationEntityHandler } from "./nftTransfer"
import BN from "bn.js"

export const marketplaceCreatedHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess) throw new Error("Marketplace created error, extrinsic isSuccess : false")
  const [marketplaceId, owner, kind] = event.event.data
  const fee = await api.query.marketplace.marketplaceMintFee()
  let record = await MarketplaceEntity.get(marketplaceId.toString())
  if (record === undefined) {
    const date = new Date()
    record = new MarketplaceEntity(marketplaceId.toString())
    record.marketplaceId = marketplaceId.toString()
    record.owner = owner.toString()
    record.kind = kind.toString()
    record.createdAt = date
    record.updatedAt = date
    await record.save()
    await genericTransferHandler(owner, "Treasury", fee.toString(), commonEventData)
  }
}

export const marketplaceConfigSetHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess) throw new Error("Marketplace config set error, extrinsic isSuccess : false")
  const [marketplaceId, commissionFee, listingFee, accountList, offchainData] = event.event.data
  const date = new Date()
  const record = await MarketplaceEntity.get(marketplaceId.toString())
  if (record === undefined) throw new Error("Marketplace not found in db")
  const isCommissionFeeSet = commissionFee.toString() !== "Noop" && commissionFee.toString() !== "Remove"
  const isCommissionFeeRemoved = commissionFee.toString() === "Remove"
  const isListingFeeSet = listingFee.toString() !== "Noop" && listingFee.toString() !== "Remove"
  const isListingFeeRemoved = listingFee.toString() === "Remove"
  const isAccountListSet = accountList.toString() !== "Noop" && accountList.toString() !== "Remove"
  const isAccountListRemoved = accountList.toString() === "Remove"
  const isOffchainDataSet = offchainData.toString() !== "Noop" && offchainData.toString() !== "Remove"
  const isOffchainDataRemoved = offchainData.toString() === "Remove"

  if (isCommissionFeeSet) {
    const parsedDatas = JSON.parse(commissionFee.toString())
    parsedDatas.set.flat
      ? ((record.commissionFee = parsedDatas.set.flat.toString()),
      //? ((record.commissionFee = await formatAmount(new BN(parsedDatas.set.flat.toString()))), //Need to be changed to float
        (record.commissionFeeType = "Flat"))
      : ((record.commissionFee = String(Number(parsedDatas.set.percentage.toString()) / 10000)), //Need to be changed to float
        (record.commissionFeeType = "Percentage"))
  } else if (isCommissionFeeRemoved) {
    record.commissionFee = null
    record.commissionFeeType = null
  }

  if (isListingFeeSet) {
    const parsedDatas = JSON.parse(listingFee.toString())
    parsedDatas.set.flat
      ? ((record.listingFee = parsedDatas.set.flat.toString()),
      //? ((record.listingFee = await formatAmount(new BN(parsedDatas.set.flat.toString()))), //Need to be changed to float
        (record.listingFeeType = "Flat"))
      : ((record.listingFee = String(Number(parsedDatas.set.percentage.toString()) / 10000)), //Need to be changed to float
      (record.listingFeeType = "Percentage"))
  } else if (isListingFeeRemoved) {
    record.listingFee = null
    record.listingFeeType = null
  }

  if (isAccountListSet) {
    record.accountList = []
    const parsedDatas = JSON.parse(accountList.toString())
    // record.accountList = parsedDatas.set.map((account: string) => record.accountList.push(account.toString()))
    record.accountList.push(parsedDatas.set.toString()) // strings in array??
  } else if (isAccountListRemoved) {
    record.accountList = []
  }

  if (isOffchainDataSet) {
    const parsedDatas = JSON.parse(offchainData.toString())
    record.offchainData = formatString(parsedDatas.set.toString())
  } else if (isOffchainDataRemoved) {
    record.offchainData = null
  }

  record.updatedAt = date
  await record.save()
}

export const marketplaceOwnerSetHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess) throw new Error("Marketplace owner set error, extrinsic isSuccess : false")
  const [marketplaceId, owner] = event.event.data
  const date = new Date()
  const record = await MarketplaceEntity.get(marketplaceId.toString())
  if (record === undefined) throw new Error("Marketplace not found in db")
  record.owner = owner.toString()
  record.updatedAt = date
  await record.save()
}

export const marketplaceKindSetHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess) throw new Error("Marketplace kind set error, extrinsic isSuccess : false")
  const [marketplaceId, kind] = event.event.data
  const date = new Date()
  const record = await MarketplaceEntity.get(marketplaceId.toString())
  if (record === undefined) throw new Error("Marketplace not found in db")
  record.kind = kind.toString()
  record.updatedAt = date
  await record.save()
}

export const nftListedHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess) throw new Error("Marketplace nft listed error, extrinsic isSuccess : false")
  const [nftId, marketplaceId, price, commissionFee] = event.event.data
  const date = new Date()

  // Format commssion fee to set type

  let marketplaceCommissionFee: any
  let marketplaceCommissionType: string
  if (commissionFee.toString()) {
    const parsedCommissionFee = JSON.parse(commissionFee.toString())
    marketplaceCommissionFee = parsedCommissionFee.flat
      ? parsedCommissionFee.flat.toString()
      : String(Number(parsedCommissionFee.percentage.toString()) / 10000)
    marketplaceCommissionType = parsedCommissionFee.flat ? "Flat" : "Percentage"
  } else {
    marketplaceCommissionFee = null
    marketplaceCommissionType = null
  }

  // Format listing fee to set type

  const marketplaceDatas = await api.query.marketplace.marketplaces(marketplaceId)
  if (!marketplaceDatas) throw new Error("Marketplace not found in db")
  logger.info("mp datas " + marketplaceDatas.toString())
  let marketplaceListingFee: any
  let marketplaceListingFeeType: string
  const parsedDatas = JSON.parse(marketplaceDatas.toString())
  const isMarketplaceListingFeeFlat = parsedDatas.listingFee && parsedDatas.listingFee.flat
  const isMarketplaceListingFeePercentage = parsedDatas.listingFee && parsedDatas.listingFee.percentage

  if (isMarketplaceListingFeeFlat) {
    marketplaceListingFee = parsedDatas.listingFee.flat.toString()
    marketplaceListingFeeType = "Flat"
  } else if (isMarketplaceListingFeePercentage) {
    marketplaceListingFee = String(Number(parsedDatas.listingFee.percentage.toString()) / 10000)
    marketplaceListingFeeType = "Percentage"
  } else {
    marketplaceListingFee = null
    marketplaceListingFeeType = null
  }

  const record = await NftEntity.get(nftId.toString())
  if (record === undefined) throw new Error("NFT not found in db")
  record.listedForSale = true
  record.marketplaceId = marketplaceId.toString()
  record.price = price.toString()
  record.priceRounded = roundPrice(record.price)
  record.timestampList = date
  record.updatedAt = date
  await record.save()
  // await nftOperationEntityHandler(record, record.owner, commonEventData, "list", [
  //   commissionFee.toString(), // what type of fee ??
  //   marketplaceListingFee, // need to add the Type ??
  // ])
}

export const nftUnlistedHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess) throw new Error("Marketplace nft unlisted error, extrinsic isSuccess : false")
  const [nftId] = event.event.data
  const date = new Date()
  const record = await NftEntity.get(nftId.toString())
  if (record === undefined) throw new Error("NFT not found in db")
  record.listedForSale = false
  record.marketplaceId = null
  record.price = null
  record.priceRounded = null
  record.timestampList = null
  record.updatedAt = date
  await record.save()
  await nftOperationEntityHandler(record, record.owner, commonEventData, "unlist")
}

export const nftSoldHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess) throw new Error("Marketplace nft listed error, extrinsic isSuccess : false")
  const [nftId, marketplaceId, buyer, listedPrice, marketplaceCut, royaltyCut] = event.event.data
  const date = new Date()
  const record = await NftEntity.get(nftId.toString())
  if (record === undefined) throw new Error("NFT not found in db")
  const seller = record.owner
  record.owner = buyer.toString()
  record.listedForSale = false
  record.marketplaceId = null // ou marketplaceId
  record.price = null
  record.priceRounded = null
  record.timestampList = null
  record.updatedAt = date
  await record.save()
  await nftOperationEntityHandler(record, seller, commonEventData, "sell", [listedPrice, marketplaceCut, royaltyCut])
}
