import { SubstrateEvent } from "@subql/types"
import { bnToBn } from "@polkadot/util/bn"
import {
  AcceptanceAction,
  CancellationFeeAction,
  DurationAction,
  RentFeeAction,
  RevocationAction,
} from "ternoa-js/rent/enum"
// import { getRentalContractData } from "ternoa-js/rent/storage"

import { nftOperationEntityHandler } from "./nftTransfer"
import { getCommonEventData, roundPrice } from "../helpers"
import { NftEntity, RentEntity } from "../types"
import { getLastRentContract } from "../helpers/rent"
//import { blockNumberToDate, getActiveSubscribedRentalContracts } from "ternoa-js"

export const rentContractCreatedHandler = async (event: SubstrateEvent): Promise<void> => {

  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess) throw new Error("NFT rent contract created error, extrinsic isSuccess : false")
  const [
    nftId,
    renter,
    duration,
    acceptanceType,
    revocationType,
    rentFee,
    renterCancellationFee,
    renteeCancellationFee,
  ] = event.event.data

  const parsedDuration = duration.toString() !== DurationAction.Infinite && JSON.parse(duration.toString())
  const isDurationFixed = parsedDuration && Boolean(parsedDuration.fixed)
  const isDurationSubscription = parsedDuration && Boolean(parsedDuration.subscription)
  const parsedAcceptance = JSON.parse(acceptanceType.toString())
  const isAutoAcceptance = Boolean(parsedAcceptance.autoAcceptance === null || parsedAcceptance.autoAcceptance)
  const isrevocationTypeNoRevocation = Boolean(revocationType.toString() === RevocationAction.NoRevocation)
  const isrevocationTypeOnSubscriptionChange = Boolean(
    revocationType.toString() === RevocationAction.OnSubscriptionChange,
  )
  const parsedRentFee = JSON.parse(rentFee.toString())
  const isRentFeeToken = Boolean(parsedRentFee.tokens)
  const parsedRenterCancellationFee = renterCancellationFee.toString() && JSON.parse(renterCancellationFee.toString())
  const isRenterCancellationFeeFixed = Boolean(parsedRenterCancellationFee && parsedRenterCancellationFee.fixedTokens)
  const isRenterCancellationFeeFlexible = Boolean(
    parsedRenterCancellationFee && parsedRenterCancellationFee.flexibleTokens,
  )
  const isRenterCancellationFeeNft = Boolean(parsedRenterCancellationFee && parsedRenterCancellationFee.nft >= 0)
  const parsedRenteeCancellationFee = renteeCancellationFee.toString() && JSON.parse(renteeCancellationFee.toString())
  const isRenteeCancellationFeeFixed = Boolean(parsedRenteeCancellationFee && parsedRenteeCancellationFee.fixedTokens)
  const isRenteeCancellationFeeFlexible = Boolean(
    parsedRenteeCancellationFee && parsedRenteeCancellationFee.flexibleTokens,
  )
  const isRenteeCancellationFeeNft = Boolean(parsedRenteeCancellationFee && parsedRenteeCancellationFee.nft >= 0)

  let record = new RentEntity(`${commonEventData.blockId}-${commonEventData.extrinsicId}-${nftId.toString()}`)
  const date = new Date()
  record.nftId = nftId.toString()
  record.hasStarted = false
  record.hasEnded = false
  record.isExpired = false
  record.renter = renter.toString()
  if (isDurationFixed) {
    record.durationType = DurationAction.Fixed
    record.blockDuration = Number.parseInt(parsedDuration.fixed.toString())
  } else if (isDurationSubscription) {
    record.durationType = DurationAction.Subscription
    record.blockDuration = Number.parseInt(parsedDuration.subscription[0].toString())
    record.blockSubscriptionRenewal =
      parsedDuration.subscription[1] && Number.parseInt(parsedDuration.subscription[1].toString())
  } else {
    record.durationType = DurationAction.Infinite
  }

  if (isAutoAcceptance) {
    record.acceptanceType = AcceptanceAction.AutoAcceptance
    record.acceptanceList = parsedAcceptance.autoAcceptance?.map((account: string) => account) ?? []
  } else {
    record.acceptanceType = AcceptanceAction.ManualAcceptance
    record.acceptanceList = parsedAcceptance.manualAcceptance?.map((account: string) => account) ?? []
  }

  if (isrevocationTypeNoRevocation) {
    record.revocationType = RevocationAction.NoRevocation
  } else if (isrevocationTypeOnSubscriptionChange) {
    record.revocationType = RevocationAction.OnSubscriptionChange
  } else {
    record.revocationType = RevocationAction.Anytime
  }

  if (isRentFeeToken) {
    record.rentFeeType = RentFeeAction.Tokens
    record.rentFee = bnToBn(parsedRentFee.tokens).toString()
    record.rentFeeRounded = roundPrice(record.rentFee)
  } else {
    record.rentFeeType = RentFeeAction.NFT
    record.rentFee = parsedRentFee.nft.toString() // must be a Number not a string but need to update Schema String | Int
    record.rentFeeRounded = Number.parseInt(record.rentFee) // just record.rentFee
  }

  if (isRenterCancellationFeeFixed) {
    record.renterCancellationFeeType = CancellationFeeAction.FixedTokens
    record.renterCancellationFee = bnToBn(parsedRenterCancellationFee.fixedTokens).toString()
    record.renterCancellationFeeRounded = roundPrice(record.renterCancellationFee)
  } else if (isRenterCancellationFeeFlexible) {
    record.renterCancellationFeeType = CancellationFeeAction.FlexibleTokens
    record.renterCancellationFee = bnToBn(parsedRenterCancellationFee.flexibleTokens).toString()
    record.renterCancellationFeeRounded = roundPrice(record.renterCancellationFee)
  } else if (isRenterCancellationFeeNft) {
    record.renterCancellationFeeType = CancellationFeeAction.NFT
    record.renterCancellationFee = parsedRenterCancellationFee.nft.toString() // must be a Number not a string but need to update Schema String | Int
    record.renterCancellationFeeRounded = Number.parseInt(record.renterCancellationFee) // just record.renterCancellationFee
  }

  if (isRenteeCancellationFeeFixed) {
    record.renteeCancellationFeeType = CancellationFeeAction.FixedTokens
    record.renteeCancellationFee = bnToBn(parsedRenteeCancellationFee.fixedTokens).toString()
    record.renteeCancellationFeeRounded = roundPrice(record.renteeCancellationFee)
  } else if (isRenteeCancellationFeeFlexible) {
    record.renteeCancellationFeeType = CancellationFeeAction.FlexibleTokens
    record.renteeCancellationFee = bnToBn(parsedRenteeCancellationFee.flexibleTokens).toString()
    record.renteeCancellationFeeRounded = roundPrice(record.renteeCancellationFee)
  } else if (isRenteeCancellationFeeNft) {
    record.renteeCancellationFeeType = CancellationFeeAction.NFT
    record.renteeCancellationFee = parsedRenteeCancellationFee.nft.toString() // must be a Number not a string but need to update Schema String | Int
    record.renteeCancellationFeeRounded = Number.parseInt(record.renteeCancellationFee) // just record.renteeCancellationFee
  }
  record.areTermsAccepted = false
  //record.createdAt = date
  record.timestampCreate = commonEventData.timestamp
  await record.save()

  // Side Effects on NftEntity
  let nftRecord = await NftEntity.get(nftId.toString())
  if (nftRecord === undefined) throw new Error("NFT record not found in db for when creating rental contract")
  nftRecord.isRented = true
  await nftRecord.save()

  // Side Effects on NftOperationEntity
  await nftOperationEntityHandler(nftRecord, record.renter, commonEventData, "RentalContractCreated", [record.durationType])
}

export const rentContractStartedHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess) throw new Error("NFT rent contract started error, extrinsic isSuccess : false")
  const [nftId, rentee] = event.event.data
  //const data = await getRentalContractData(Number(nftId.toString())) //issue with ternoaJS export
  let record = await getLastRentContract(nftId.toString())
  if (record === undefined) throw new Error("Rental contract not found in db")
  record.hasStarted = true
  record.rentee = rentee.toString()
  //record.startBlockId = data.startBlock.toString() // not number ??
  record.rentOffers = [] // or null ??
  record.timestampStart = commonEventData.timestamp
  await record.save()

  // Side Effects on NftEntity
  let nftRecord = await NftEntity.get(nftId.toString())
  if (nftRecord === undefined) throw new Error("NFT record not found in db for when rental contract started")
  nftRecord.rentee = record.rentee
  await nftRecord.save()

  // Side Effects on NftOperationEntity
  await nftOperationEntityHandler(nftRecord, record.renter, commonEventData, "RentalContractStarted", [
    record.startBlockId,
    record.durationType,
    record.blockDuration,
    record.blockSubscriptionRenewal,
    record.rentFeeType,
    record.rentFee,
    record.rentFeeRounded,
  ])
}

export const rentContractOfferCreatedHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess) throw new Error("NFT rent offer created error, extrinsic isSuccess : false")
  const [nftId, rentee] = event.event.data
  let record = await getLastRentContract(nftId.toString())
  if (record === undefined) throw new Error("Rental contract not found in db")
  if (record.rentOffers) record.rentOffers.push(rentee.toString())
  else record.rentOffers = [rentee.toString()]
  record.nbRentOffers = record.nbRentOffers + 1 // totalRentOffersRecieived better ? currentNbOffer needed ?
  record.timestampLastOffer = commonEventData.timestamp
  await record.save()
}

export const rentContractOfferRetractedHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess) throw new Error("NFT rent offer retracted error, extrinsic isSuccess : false")
  const [nftId, rentee] = event.event.data
  let record = await getLastRentContract(nftId.toString())
  if (record === undefined) throw new Error("Rental contract not found in db")
  record.rentOffers = record.rentOffers.filter((x) => x !== rentee.toString())
  // confirm that record.nbRentOffers not updated ??
  await record.save()
}

export const rentContractSubscriptionTermsChangedHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess)
    throw new Error("NFT contract subscription terms changed error, extrinsic isSuccess : false")
  const [nftId] = event.event.data
  let record = await getLastRentContract(nftId.toString())
  if (record === undefined) throw new Error("Rental contract not found in db")
  record.areTermsAccepted = false
  record.nbTermsUpdate = record.nbTermsUpdate + 1
  record.timestampLastTermsUpdate = commonEventData.timestamp
  await record.save()
}

export const rentContractSubscriptionTermsAcceptedHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess)
    throw new Error("NFT contract subscription terms accepted error, extrinsic isSuccess : false")
  const [nftId] = event.event.data
  let record = await getLastRentContract(nftId.toString())
  if (record === undefined) throw new Error("Rental contract not found in db")
  record.areTermsAccepted = true
  await record.save()
}

export const rentContractRevokedHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess) throw new Error("NFT rent contract revoked error, extrinsic isSuccess : false")
  const [nftId, revokedBy] = event.event.data
  let record = await getLastRentContract(nftId.toString())
  if (record === undefined) throw new Error("Rental contract not found in db")
  record.hasEnded = true // if record.hasStarted ?? has Ended : null // Warning on rent.ts helper
  record.revokedBy = revokedBy.toString()
  record.timestampRevoke = commonEventData.timestamp
  await record.save()

  // Side Effects on NftEntity
  let nftRecord = await NftEntity.get(nftId.toString())
  if (nftRecord === undefined) throw new Error("NFT record not found in db for when revoking rental contract")
  nftRecord.isRented = false
  nftRecord.rentee = null
  await nftRecord.save()

  // Side Effects on NftOperationEntity
  await nftOperationEntityHandler(nftRecord, record.revokedBy, commonEventData, "RentalContractRevoked")
}

// [Root Events] - Automatic events :

export const rentContractEndedHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess) throw new Error("NFT contract ended error, extrinsic isSuccess : false")
  const [nftId, revokedBy] = event.event.data
  let record = await getLastRentContract(nftId.toString())
  if (record === undefined) throw new Error("Rental contract not found in db")
  record.hasEnded = true
  record.revokedBy = revokedBy.toString() // means contract terms changed and not accepted => address of rentee
  record.timestampEnd = commonEventData.timestamp
  await record.save()

  // Side Effects on NftEntity
  let nftRecord = await NftEntity.get(nftId.toString())
  if (nftRecord === undefined) throw new Error("NFT record not found in db for when rental contract ended")
  nftRecord.isRented = false
  nftRecord.rentee = null
  await nftRecord.save()

  // Side Effects on NftOperationEntity
  await nftOperationEntityHandler(nftRecord, record.revokedBy, commonEventData, "RentalContractEnded")
}

export const rentContractAvailableExpiredHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess) throw new Error("NFT contract expired error, extrinsic isSuccess : false")
  const [nftId] = event.event.data
  let record = await getLastRentContract(nftId.toString())
  if (record === undefined) throw new Error("Rental contract not found in db")
  record.isExpired = true
  record.timestampExpire = commonEventData.timestamp
  await record.save()

  // Side Effects on NftEntity
  let nftRecord = await NftEntity.get(nftId.toString())
  if (nftRecord === undefined) throw new Error("NFT record not found in db for when rental contract expired")
  nftRecord.isRented = false
  nftRecord.rentee = null
  await nftRecord.save()

  // Side Effects on NftOperationEntity
  await nftOperationEntityHandler(nftRecord, null, commonEventData, "RentalContractExpired")
}

export const rentContractSubscriptionPeriodStartedHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess)
    throw new Error("NFT contract subscription started error, extrinsic isSuccess : false")
  const [nftId] = event.event.data
  let record = await getLastRentContract(nftId.toString())
  if (record === undefined) throw new Error("Rental contract not found in db")
  // const { subscriptionQueue } = await getActiveSubscribedRentalContracts() // does not exist anymore on dev-1 and changed on dev-0
  // const filteredQueue = subscriptionQueue.filter((x: number[]) => {
  //   if (x[0] == Number(nftId.toString())) return x[1]
  // })
  //const filteredQueue = subscriptionQueue.filter((x: number[]) => x[0] === Number(nftId.toString()))
  record.nbSubscriptionRenewal = record.nbSubscriptionRenewal + 1
  record.timestampLastSubscriptionRenewal = commonEventData.timestamp
  // record.timestampNextSubscriptionRenewal = await blockNumberToDate(filteredQueue[1])
  await record.save()
}
