import BN from "bn.js"
import { SubstrateEvent } from "@subql/types"
import { bnToBn } from "@polkadot/util/bn"

import { getCommonEventData, getLastAuction, roundPrice } from "../helpers"
import { NftEntity, AuctionEntity, Bidder } from "../types"

import { TypeOfListing } from "./nfts"
import { nftOperationEntityHandler, NFTOperation } from "./nftOperations"

export enum TypeOfSale {
  AuctionEnd = "auctionEnd",
  Direct = "direct",
}

export const auctionCreatedHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess) throw new Error("Auction creation error, extrinsic isSuccess : false")
  const [nftId, marketplaceId, creator, startPrice, buyItPrice, startBlockId, endBlockId] = event.event.data

  let record = new AuctionEntity(`${commonEventData.extrinsicId}-${nftId.toString()}`)
  record.nftId = nftId.toString()
  record.marketplaceId = marketplaceId.toString()
  record.creator = creator.toString()
  record.startPrice = bnToBn(startPrice.toString()).toString()
  record.startPriceRounded = roundPrice(record.startPrice)
  const buyItPriceAmount = bnToBn(buyItPrice.toString()).toString()
  record.buyItNowPrice = buyItPriceAmount === "0" ? null : buyItPriceAmount
  record.buyItNowPriceRounded = record.buyItNowPrice && roundPrice(record.buyItNowPrice)
  record.startBlockId = Number.parseInt(startBlockId.toString())
  record.endBlockId = Number.parseInt(endBlockId.toString())
  record.isCompleted = false
  record.isCancelled = false
  record.isExtendedPeriod = false
  record.bidders = []
  record.nbBidders = 0
  record.topBidAmount = null
  record.topBidAmountRounded = null
  record.typeOfSale = null
  record.timestampCreated = commonEventData.timestamp
  record.timestampEnded = null
  record.timestampLastBid = null
  record.timestampCancelled = null

  await record.save()

  // Side Effects on NftEntity
  const nftRecord = await NftEntity.get(nftId.toString())
  if (nftRecord === undefined) throw new Error("NFT record not found in db for when creating auction")
  nftRecord.isListed = true
  nftRecord.typeOfListing = TypeOfListing.Auction
  nftRecord.auctionId = `${commonEventData.extrinsicId}-${nftId.toString()}`
  nftRecord.marketplaceId = record.marketplaceId
  nftRecord.timestampListed = record.timestampCreated
  await nftRecord.save()

  // Side Effects on NftOperationEntity
  await nftOperationEntityHandler(nftRecord, record.creator, commonEventData, NFTOperation.AuctionCreated, [
    record.marketplaceId,
    record.startPrice,
    record.buyItNowPrice,
  ])
}

export const auctionCancelledHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess) throw new Error("Auction cancellation error, extrinsic isSuccess : false")
  const [nftId] = event.event.data
  let record = await getLastAuction(nftId.toString())
  if (record === undefined) throw new Error("Auction not found in db")
  record.isCancelled = true
  record.marketplaceId = null
  record.startPrice = null
  record.startPriceRounded = null
  record.buyItNowPrice = null
  record.buyItNowPriceRounded = null
  record.startBlockId = null
  record.endBlockId = null
  record.timestampCancelled = commonEventData.timestamp
  await record.save()

  // Side Effects on NftEntity
  const nftRecord = await NftEntity.get(nftId.toString())
  if (nftRecord === undefined) throw new Error("NFT record not found in db for when cancelling auction")
  nftRecord.isListed = false
  nftRecord.typeOfListing = null
  nftRecord.auctionId = null
  nftRecord.marketplaceId = null
  nftRecord.timestampListed = null
  await nftRecord.save()

  // Side Effects on NftOperationEntity
  await nftOperationEntityHandler(nftRecord, record.creator, commonEventData, NFTOperation.AuctionCancelled)
}

export const auctionCompletedHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess) throw new Error("Auction completion error, extrinsic isSuccess : false")
  const [nftId, newOwner, amount, marketplaceCut, royaltyCut] = event.event.data
  let record = await getLastAuction(nftId.toString())
  if (record === undefined) throw new Error("Auction not found in db")

  const isBuyItNow = record.buyItNowPrice !== null && new BN(record.buyItNowPrice).cmp(bnToBn(amount.toString())) === 0

  record.isCompleted = true
  record.topBidAmount = bnToBn(amount.toString()).toString()
  record.topBidAmountRounded = roundPrice(record.topBidAmount)
  record.typeOfSale = isBuyItNow ? TypeOfSale.Direct : TypeOfSale.AuctionEnd
  record.timestampEnded = commonEventData.timestamp
  await record.save()

  // Side Effects on NftEntity
  const nftRecord = await NftEntity.get(nftId.toString())
  if (nftRecord === undefined) throw new Error("NFT record not found in db for when completing auction")
  const seller = nftRecord.owner
  nftRecord.owner = newOwner.toString() || seller
  nftRecord.isListed = false
  nftRecord.typeOfListing = null
  nftRecord.auctionId = null
  nftRecord.marketplaceId = null
  nftRecord.timestampListed = null
  await nftRecord.save()

  // Side Effects on NftOperationEntity
  await nftOperationEntityHandler(
    nftRecord,
    seller,
    commonEventData,
    isBuyItNow ? NFTOperation.AuctionBuyItNow : NFTOperation.AuctionCompleted,
    [record.marketplaceId, amount.toString(), marketplaceCut.toString(), royaltyCut.toString()],
  )
}

export const auctionBidAddedHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess) throw new Error("New bid error, extrinsic isSuccess : false")
  const [nftId, bidder, amount] = event.event.data
  let record = await getLastAuction(nftId.toString())
  if (record === undefined) throw new Error("Auction not found in db")

  const gracePeriod = api.consts.auction.auctionGracePeriod
  if (gracePeriod === undefined) throw new Error("Cannot retrieve constant: auctionGracePeriod")
  const currentBlockId = new BN(commonEventData.blockId)
  const endBlockId = new BN(record.endBlockId)
  const gracePeriodBlocks = new BN(gracePeriod.toString())
  const isGracePeriod = endBlockId.sub(currentBlockId).lt(gracePeriodBlocks)
  const hasAlreadyBid = record.bidders.some((x) => x.bidder === bidder.toString())
  const newBidders = hasAlreadyBid ? record.bidders.filter((x) => x.bidder !== bidder.toString()) : record.bidders
  const newNbBidders = hasAlreadyBid ? record.nbBidders : record.nbBidders + 1
  const bidAmount = bnToBn(amount.toString()).toString()
  const newBidder: Bidder = {
    bidder: bidder.toString(),
    amount: bidAmount,
    amountRounded: roundPrice(bidAmount),
    timestampBid: commonEventData.timestamp,
  }
  newBidders.push(newBidder)

  record.endBlockId = isGracePeriod
    ? Number.parseInt(currentBlockId.add(gracePeriodBlocks).toString())
    : record.endBlockId
  record.bidders = newBidders
  record.isExtendedPeriod = isGracePeriod
  record.nbBidders = newNbBidders
  record.topBidAmount = bnToBn(amount.toString()).toString()
  record.topBidAmountRounded = roundPrice(record.topBidAmount)
  record.timestampLastBid = commonEventData.timestamp
  await record.save()

  // Side Effects on NftOperationEntity
  const nftRecord = await NftEntity.get(nftId.toString())
  await nftOperationEntityHandler(nftRecord, bidder.toString(), commonEventData, NFTOperation.BidAdded, [
    amount.toString(),
  ])
}

export const auctionBidRemovedHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess) throw new Error("Remove bid error, extrinsic isSuccess : false")
  const [nftId, bidder, amount] = event.event.data
  let record = await getLastAuction(nftId.toString())
  if (record === undefined) throw new Error("Auction not found in db")

  const newBidders = record.bidders.filter((x) => x.bidder !== bidder.toString())
  const newTopBid = newBidders.length > 0 ? newBidders[newBidders.length - 1].amount : null
  const newNbBidders = record.nbBidders - 1

  record.bidders = newBidders
  record.nbBidders = newNbBidders
  record.topBidAmount = newTopBid
  record.topBidAmountRounded = newTopBid && roundPrice(record.topBidAmount)
  await record.save()

  // Side Effects on NftOperationEntity
  const nftRecord = await NftEntity.get(nftId.toString())
  await nftOperationEntityHandler(nftRecord, bidder.toString(), commonEventData, NFTOperation.BidRemoved, [
    amount.toString(),
  ])
}
