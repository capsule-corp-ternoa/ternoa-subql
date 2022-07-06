import { SubstrateEvent } from "@subql/types"
import { bnToBn } from "@polkadot/util/bn"
import { formatString, getCommonEventData, roundPrice } from "../helpers"
import { genericTransferHandler } from "./balances"
import { MarketplaceEntity, NftEntity } from "../types"
import { nftOperationEntityHandler } from "./nftTransfer"

// type CommissionType = "flat" | "percentage"
// type MarketplaceDataType = {
//   owner: string
//   kind: string
//   commissionFee: { [type in CommissionType]: string; }
//   listingFee: { [type in CommissionType]: string; }
//   accountList: [string]
//   offchainData: string
// }

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
      ? ((record.commissionFee = bnToBn(parsedDatas.set.flat).toString()),
        (record.commissionFeeRounded = roundPrice(record.commissionFee)),
        (record.commissionFeeType = "Flat"))
      : ((record.commissionFee = String(Number(parsedDatas.set.percentage.toString()) / 10000)),
        (record.commissionFeeRounded = Number(record.commissionFee)),
        (record.commissionFeeType = "Percentage"))
  } else if (isCommissionFeeRemoved) {
    record.commissionFee = null
    record.commissionFeeRounded = null
    record.commissionFeeType = null
  }

  if (isListingFeeSet) {
    const parsedDatas = JSON.parse(listingFee.toString())
    parsedDatas.set.flat
      ? ((record.listingFee = bnToBn(parsedDatas.set.flat).toString()),
        (record.listingFeeRounded = roundPrice(record.listingFee)),
        (record.listingFeeType = "Flat"))
      : ((record.listingFee = String(Number(parsedDatas.set.percentage.toString()) / 10000)),
        (record.listingFeeRounded = Number(record.listingFee)),
        (record.listingFeeType = "Percentage"))
  } else if (isListingFeeRemoved) {
    record.listingFee = null
    record.listingFeeRounded = null
    record.listingFeeType = null
  }

  if (isAccountListSet) {
    record.accountList = []
    const parsedDatas = JSON.parse(accountList.toString())
    parsedDatas.set.map((account: string) => record.accountList.push(account.toString()))
  } else if (isAccountListRemoved) {
    record.accountList = null
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

  // Format commission fee to set type
  let marketplaceCommissionFeeType: string = null
  let marketplaceCommissionFee: string = null
  let marketplaceCommissionFeeRounded: number = null
  if (commissionFee.toString()) {
    const parsedCommissionFee = JSON.parse(commissionFee.toString())
    const isMarketplaceCommissionFeeFlat = parsedCommissionFee && parsedCommissionFee.flat
    const isMarketplaceCommissionFeePercentage = parsedCommissionFee && parsedCommissionFee.percentage
    if (isMarketplaceCommissionFeeFlat) {
      marketplaceCommissionFeeType = "Flat"
      marketplaceCommissionFee = bnToBn(parsedCommissionFee.flat).toString()
      marketplaceCommissionFeeRounded = roundPrice(marketplaceCommissionFee)
    } else if (isMarketplaceCommissionFeePercentage) {
      marketplaceCommissionFeeType = "Percentage"
      marketplaceCommissionFee = String(Number(parsedCommissionFee.percentage.toString()) / 10000)
      marketplaceCommissionFeeRounded = Number(marketplaceCommissionFee)
    }
  }

  // Format listing fee to set type
  const marketplaceDatas = await api.query.marketplace.marketplaces(marketplaceId)
  if (!marketplaceDatas) throw new Error("Marketplace not found in db")
  let marketplaceListingFeeType: string = null
  let marketplaceListingFee: string = null
  let marketplaceListingFeeRounded: number = null
  const parsedDatas = JSON.parse(marketplaceDatas.toString()) //as MarketplaceDataType
  const isMarketplaceListingFeeFlat = parsedDatas.listingFee && parsedDatas.listingFee.flat
  const isMarketplaceListingFeePercentage = parsedDatas.listingFee && parsedDatas.listingFee.percentage
  if (isMarketplaceListingFeeFlat) {
    marketplaceListingFeeType = "Flat"
    marketplaceListingFee = bnToBn(parsedDatas.listingFee.flat).toString()
    marketplaceListingFeeRounded = roundPrice(marketplaceListingFee)
  } else if (isMarketplaceListingFeePercentage) {
    marketplaceListingFeeType = "Percentage"
    marketplaceListingFee = String(Number(parsedDatas.listingFee.percentage.toString()) / 10000)
    marketplaceListingFeeRounded = Number(marketplaceListingFee)
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
  await nftOperationEntityHandler(record, record.owner, commonEventData, "list", [
    marketplaceCommissionFeeType,
    marketplaceCommissionFee,
    marketplaceCommissionFeeRounded,
    marketplaceListingFeeType,
    marketplaceListingFee,
    marketplaceListingFeeRounded,
  ])
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
  record.marketplaceId = null
  record.price = null
  record.priceRounded = null
  record.timestampList = null
  record.updatedAt = date
  await record.save()
  await nftOperationEntityHandler(record, seller, commonEventData, "sell", [
    marketplaceId.toString(),
    listedPrice.toString(),
    marketplaceCut.toString(),
    royaltyCut.toString(),
  ])
}
