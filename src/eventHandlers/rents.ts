import { SubstrateEvent } from "@subql/types"
import { bnToBn } from "@polkadot/util/bn"
import { AcceptanceAction, CancellationFeeAction, DurationAction, RentFeeAction } from "ternoa-js/rent/enum"

import { nftOperationEntityHandler, NFTOperation } from "./nftOperations"

import { getCommonEventData, roundPrice } from "../helpers"
import { NftEntity, RentEntity } from "../types"
import { getLastRentContract } from "../helpers/rent"

export const rentContractCreatedHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess) throw new Error("NFT rent contract created error, extrinsic isSuccess : false")
  const [
    nftId,
    renter,
    duration,
    acceptanceType,
    renterCanRevoke,
    rentFee,
    renterCancellationFee,
    renteeCancellationFee,
  ] = event.event.data

  const parsedDuration = JSON.parse(duration.toString())
  const isDurationFixed = DurationAction.Fixed in parsedDuration
  const parsedAcceptance = JSON.parse(acceptanceType.toString())
  const isAutoAcceptance = AcceptanceAction.AutoAcceptance in parsedAcceptance
  const parsedRentFee = JSON.parse(rentFee.toString())
  const isRentFeeToken = RentFeeAction.Tokens in parsedRentFee
  const parsedRenterCancellationFee =
    renterCancellationFee.toString() !== CancellationFeeAction.None && JSON.parse(renterCancellationFee.toString())
  const parsedRenteeCancellationFee =
    renteeCancellationFee.toString() !== CancellationFeeAction.None && JSON.parse(renteeCancellationFee.toString())

  let record = new RentEntity(`${commonEventData.extrinsicId}-${nftId.toString()}`)
  record.nftId = nftId.toString()
  record.hasStarted = false
  record.hasEnded = false
  record.hasBeenCanceled = false
  record.isExpired = false
  record.renter = renter.toString()
  record.renterCanRevoke = renterCanRevoke.toString() === "true"
  record.rentOffers = []

  if (isDurationFixed) {
    record.durationType = DurationAction.Fixed
    record.blockDuration = Number.parseInt(parsedDuration.fixed.toString())
  } else {
    record.durationType = DurationAction.Subscription
    record.blockDuration = Number.parseInt(parsedDuration.subscription.periodLength.toString())
    record.maxSubscriptionBlockDuration = Number.parseInt(parsedDuration.subscription.maxDuration.toString())
    record.isSubscriptionChangeable = Boolean(parsedDuration.subscription.isChangeable.toString() === "true")
    record.newTermsAvailable = Boolean(parsedDuration.subscription.newTerms.toString() === "true")
  }

  if (isAutoAcceptance) {
    record.acceptanceType = AcceptanceAction.AutoAcceptance
    record.acceptanceList = parsedAcceptance.autoAcceptance?.map((account: string) => account) ?? []
  } else {
    record.acceptanceType = AcceptanceAction.ManualAcceptance
    record.acceptanceList = parsedAcceptance.manualAcceptance?.map((account: string) => account) ?? []
  }

  if (isRentFeeToken) {
    record.rentFeeType = RentFeeAction.Tokens
    record.rentFee = bnToBn(parsedRentFee.tokens).toString()
    record.rentFeeRounded = roundPrice(record.rentFee)
  } else {
    record.rentFeeType = CancellationFeeAction.NFT
    record.rentFee = parsedRentFee.nft.toString()
    record.rentFeeRounded = Number.parseInt(record.rentFee)
  }

  switch (true) {
    case parsedRenterCancellationFee && CancellationFeeAction.FixedTokens in parsedRenterCancellationFee:
      record.renterCancellationFeeType = CancellationFeeAction.FixedTokens
      record.renterCancellationFee = bnToBn(parsedRenterCancellationFee.fixedTokens).toString()
      record.renterCancellationFeeRounded = roundPrice(record.renterCancellationFee)
      break
    case parsedRenterCancellationFee && CancellationFeeAction.FlexibleTokens in parsedRenterCancellationFee:
      record.renterCancellationFeeType = CancellationFeeAction.FlexibleTokens
      record.renterCancellationFee = bnToBn(parsedRenterCancellationFee.flexibleTokens).toString()
      record.renterCancellationFeeRounded = roundPrice(record.renterCancellationFee)
      break
    case parsedRenterCancellationFee && CancellationFeeAction.NFT in parsedRenterCancellationFee:
      record.renterCancellationFeeType = CancellationFeeAction.NFT
      record.renterCancellationFee = parsedRenterCancellationFee.nft.toString()
      record.renterCancellationFeeRounded = Number(record.renterCancellationFee)
      break
    default:
      record.renterCancellationFeeType = CancellationFeeAction.None
      record.renterCancellationFee = null
      record.renterCancellationFeeRounded = null
      break
  }

  switch (true) {
    case parsedRenteeCancellationFee && CancellationFeeAction.FixedTokens in parsedRenteeCancellationFee:
      record.renteeCancellationFeeType = CancellationFeeAction.FixedTokens
      record.renteeCancellationFee = bnToBn(parsedRenteeCancellationFee.fixedTokens).toString()
      record.renteeCancellationFeeRounded = roundPrice(record.renteeCancellationFee)
      break
    case parsedRenteeCancellationFee && CancellationFeeAction.FlexibleTokens in parsedRenteeCancellationFee:
      record.renteeCancellationFeeType = CancellationFeeAction.FlexibleTokens
      record.renteeCancellationFee = bnToBn(parsedRenteeCancellationFee.flexibleTokens).toString()
      record.renteeCancellationFeeRounded = roundPrice(record.renteeCancellationFee)
      break
    case parsedRenteeCancellationFee && CancellationFeeAction.NFT in parsedRenteeCancellationFee:
      record.renteeCancellationFeeType = CancellationFeeAction.NFT
      record.renteeCancellationFee = parsedRenteeCancellationFee.nft.toString()
      record.renteeCancellationFeeRounded = Number(record.renteeCancellationFee)
      break
    default:
      record.renteeCancellationFeeType = CancellationFeeAction.None
      record.renteeCancellationFee = null
      record.renteeCancellationFeeRounded = null
      break
  }
  record.timestampCreate = commonEventData.timestamp
  await record.save()

  // Side Effects on NftEntity
  let nftRecord = await NftEntity.get(nftId.toString())
  if (nftRecord === undefined) throw new Error("NFT record not found in db for when creating rental contract")
  nftRecord.isRented = true
  nftRecord.rentalContractId = `${commonEventData.extrinsicId}-${nftId.toString()}`
  await nftRecord.save()

  // Side Effects on NftOperationEntity
  await nftOperationEntityHandler(nftRecord, record.renter, commonEventData, NFTOperation.RentalContractCreated, [
    record.durationType,
  ])
}

export const rentContractStartedHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess) throw new Error("NFT rent contract started error, extrinsic isSuccess : false")
  const [nftId, rentee] = event.event.data
  let record = await getLastRentContract(nftId.toString())
  if (record === undefined) throw new Error("Rental contract not found in db")
  record.hasStarted = true
  record.rentee = rentee.toString()
  record.startBlockId = Number(commonEventData.blockId)
  if (record.durationType === DurationAction.Subscription) {
    record.nextSubscriptionRenewalBlockId = record.blockDuration + record.startBlockId
  }
  record.rentOffers = []
  record.nbRentOffers = 0
  record.timestampStart = commonEventData.timestamp
  await record.save()

  // Side Effects on NftEntity
  let nftRecord = await NftEntity.get(nftId.toString())
  if (nftRecord === undefined) throw new Error("NFT record not found in db for when rental contract started")
  nftRecord.rentee = record.rentee
  await nftRecord.save()

  // Side Effects on NftOperationEntity
  await nftOperationEntityHandler(nftRecord, record.renter, commonEventData, NFTOperation.RentalContractStarted, [
    record.startBlockId,
    record.durationType,
    record.blockDuration,
    record.maxSubscriptionBlockDuration,
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
  record.nbRentOffers = record.nbRentOffers + 1
  record.totalRentOffersReceived = record.totalRentOffersReceived + 1
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
  record.nbRentOffers = record.nbRentOffers > 0 ? record.nbRentOffers - 1 : record.nbRentOffers
  await record.save()
}

export const rentContractSubscriptionTermsChangedHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess)
    throw new Error("NFT contract subscription terms changed error, extrinsic isSuccess : false")
  const [nftId, period, maxDuration, isChangeable, rentFee] = event.event.data
  let record = await getLastRentContract(nftId.toString())
  if (record === undefined) throw new Error("Rental contract not found in db")
  record.blockDuration = Number.parseInt(period.toString())
  record.maxSubscriptionBlockDuration = Number.parseInt(maxDuration.toString())
  record.isSubscriptionChangeable = Boolean(isChangeable.toString() === "true")
  record.newTermsAvailable = true
  record.rentFee = bnToBn(rentFee.toString()).toString()
  record.rentFeeRounded = roundPrice(record.rentFee)
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
  record.newTermsAvailable = false
  await record.save()
}

export const rentContractCanceledHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess) throw new Error("NFT rent contract canceled error, extrinsic isSuccess : false")
  const [nftId] = event.event.data
  let record = await getLastRentContract(nftId.toString())
  if (record === undefined) throw new Error("Rental contract not found in db")
  record.hasBeenCanceled = true
  record.timestampCancel = commonEventData.timestamp
  await record.save()

  // Side Effects on NftEntity
  let nftRecord = await NftEntity.get(nftId.toString())
  if (nftRecord === undefined) throw new Error("NFT record not found in db for when revoking rental contract")
  nftRecord.isRented = false
  nftRecord.rentee = null
  nftRecord.rentalContractId = null
  await nftRecord.save()

  // Side Effects on NftOperationEntity
  await nftOperationEntityHandler(nftRecord, record.renter, commonEventData, NFTOperation.RentalContractCanceled)
}

export const rentContractRevokedHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess) throw new Error("NFT rent contract revoked error, extrinsic isSuccess : false")
  const [nftId, revokedBy] = event.event.data
  let record = await getLastRentContract(nftId.toString())
  if (record === undefined) throw new Error("Rental contract not found in db")
  record.hasEnded = true
  record.revokedBy = revokedBy.toString()
  record.timestampRevoke = commonEventData.timestamp
  await record.save()

  // Side Effects on NftEntity
  let nftRecord = await NftEntity.get(nftId.toString())
  if (nftRecord === undefined) throw new Error("NFT record not found in db for when revoking rental contract")
  nftRecord.isRented = false
  nftRecord.rentee = null
  nftRecord.rentalContractId = null
  await nftRecord.save()

  // Side Effects on NftOperationEntity
  await nftOperationEntityHandler(nftRecord, record.revokedBy, commonEventData, NFTOperation.RentalContractRevoked)
}

// [Root Events] - Automatic events :

export const rentContractEndedHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess) throw new Error("NFT contract ended error, extrinsic isSuccess : false")
  const [nftId, revokedBy] = event.event.data
  let record = await getLastRentContract(nftId.toString())
  if (record === undefined) throw new Error("Rental contract not found in db")
  record.hasEnded = true
  record.revokedBy = revokedBy.toString().length > 0 ? revokedBy.toString() : null
  record.timestampEnd = commonEventData.timestamp
  await record.save()

  // Side Effects on NftEntity
  let nftRecord = await NftEntity.get(nftId.toString())
  if (nftRecord === undefined) throw new Error("NFT record not found in db for when rental contract ended")
  nftRecord.isRented = false
  nftRecord.rentee = null
  nftRecord.rentalContractId = null
  await nftRecord.save()

  // Side Effects on NftOperationEntity
  await nftOperationEntityHandler(nftRecord, record.revokedBy, commonEventData, NFTOperation.RentalContractEnded)
}

export const rentContractExpiredHandler = async (event: SubstrateEvent): Promise<void> => {
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
  nftRecord.rentalContractId = null
  await nftRecord.save()

  // Side Effects on NftOperationEntity
  await nftOperationEntityHandler(nftRecord, null, commonEventData, NFTOperation.RentalContractExpired)
}

export const rentContractSubscriptionPeriodStartedHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess)
    throw new Error("NFT contract subscription started error, extrinsic isSuccess : false")
  const [nftId] = event.event.data
  let record = await getLastRentContract(nftId.toString())
  if (record === undefined) throw new Error("Rental contract not found in db")
  const nextBlockRenewal = record.blockDuration + +commonEventData.blockId
  const lastBlockRenewal = record.startBlockId + record.maxSubscriptionBlockDuration
  record.nbSubscriptionRenewal =
    lastBlockRenewal >= nextBlockRenewal ? record.nbSubscriptionRenewal + 1 : record.nbSubscriptionRenewal
  record.nextSubscriptionRenewalBlockId = lastBlockRenewal >= nextBlockRenewal ? nextBlockRenewal : lastBlockRenewal
  record.timestampLastSubscriptionRenewal = commonEventData.timestamp
  await record.save()
}
