import { SubstrateEvent } from "@subql/types"
import { bnToBn } from "@polkadot/util/bn"
import { AcceptanceAction, CancellationFeeAction, DurationAction, RentFeeAction } from "ternoa-js/rent/enum"

import { nftOperationEntityHandler } from "./nftTransfer"
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
    renterCancellationFee.toString() !== "None" && JSON.parse(renterCancellationFee.toString()) // to be updated with last ternoa sdk version : replace "None" by CancellationFeeAction.None
  const parsedRenteeCancellationFee =
    renteeCancellationFee.toString() !== "None" && JSON.parse(renteeCancellationFee.toString()) // to be updated with last ternoa sdk version : replace "None" by CancellationFeeAction.None

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
    record.duration = DurationAction.Fixed
    record.blockDuration = Number.parseInt(parsedDuration.fixed.toString())
  } else {
    record.duration = DurationAction.Subscription
    record.blockDuration = Number.parseInt(parsedDuration.subscription.periodLength.toString())
    record.maxSubscriptionBlockDuration = Number.parseInt(parsedDuration.subscription.maxDuration.toString())
    record.isSubscriptionChangeable = Boolean(parsedDuration.subscription.isChangeable.toString() === "true")
    record.newTermsAvailable = Boolean(parsedDuration.subscription.newTerms.toString() === "true")
  }

  if (isAutoAcceptance) {
    record.acceptance = AcceptanceAction.AutoAcceptance
    record.acceptanceList = parsedAcceptance.autoAcceptance?.map((account: string) => account) ?? []
  } else {
    record.acceptance = AcceptanceAction.ManualAcceptance
    record.acceptanceList = parsedAcceptance.manualAcceptance?.map((account: string) => account) ?? []
  }

  if (isRentFeeToken) {
    record.rentFee = RentFeeAction.Tokens
    record.rentFeeValue = bnToBn(parsedRentFee.tokens).toString() 
    record.rentFeeValueRounded = roundPrice(record.rentFeeValue)
  } else {
    record.rentFee = "nft" // to be updated with last ternoa sdk version : replace "nft" by CancellationFeeAction.NFT
    record.rentFeeValue = parsedRentFee.nft.toString()
    record.rentFeeValueRounded = Number.parseInt(record.rentFeeValue)
  }

  switch (true) {
    case parsedRenterCancellationFee && CancellationFeeAction.FixedTokens in parsedRenterCancellationFee:
      record.renterCancellationFee = CancellationFeeAction.FixedTokens
      record.renterCancellationFeeValue = bnToBn(parsedRenterCancellationFee[record.renterCancellationFee]).toString()
      record.renterCancellationFeeValueRounded = roundPrice(record.renterCancellationFeeValue)
      break
    case parsedRenterCancellationFee && CancellationFeeAction.FlexibleTokens in parsedRenterCancellationFee:
      record.renterCancellationFee = CancellationFeeAction.FlexibleTokens
      record.renterCancellationFeeValue = bnToBn(parsedRenterCancellationFee[record.renterCancellationFee]).toString()
      record.renterCancellationFeeValueRounded = roundPrice(record.renterCancellationFeeValue)
      break
    case parsedRenterCancellationFee && "nft" in parsedRenterCancellationFee: // to be updated with last ternoa sdk version : replace "nft" by CancellationFeeAction.NFT
      record.renterCancellationFee = "nft" // to be updated with last ternoa sdk version : replace "nft" by CancellationFeeAction.NFT
      record.renterCancellationFeeValue = parsedRenterCancellationFee.nft.toString()
      record.renterCancellationFeeValueRounded = Number(record.renterCancellationFeeValue)
      break
    default:
      record.renterCancellationFee = "None" // to be updated with last ternoa sdk version : replace "None" by CancellationFeeAction.None
      record.renterCancellationFeeValue = null
      record.renterCancellationFeeValueRounded = null
      break
  }

  switch (true) {
    case parsedRenteeCancellationFee && CancellationFeeAction.FixedTokens in parsedRenteeCancellationFee:
      record.renteeCancellationFee = CancellationFeeAction.FixedTokens
      record.renteeCancellationFeeValue = bnToBn(parsedRenteeCancellationFee[record.renteeCancellationFee]).toString()
      record.renteeCancellationFeeValueRounded = roundPrice(record.renteeCancellationFeeValue)
      break
    case parsedRenteeCancellationFee && CancellationFeeAction.FlexibleTokens in parsedRenteeCancellationFee:
      record.renteeCancellationFee = CancellationFeeAction.FlexibleTokens
      record.renteeCancellationFeeValue = bnToBn(parsedRenteeCancellationFee[record.renteeCancellationFee]).toString()
      record.renteeCancellationFeeValueRounded = roundPrice(record.renteeCancellationFeeValue)
      break
    case parsedRenteeCancellationFee && "nft" in parsedRenteeCancellationFee: // to be updated with last ternoa sdk version : replace "nft" by CancellationFeeAction.NFT
      record.renteeCancellationFee = "nft" // to be updated with last ternoa sdk version : replace "nft" by CancellationFeeAction.NFT
      record.renteeCancellationFeeValue = parsedRenteeCancellationFee.nft.toString()
      record.renteeCancellationFeeValueRounded = Number(record.renteeCancellationFeeValue)
      break
    default:
      record.renteeCancellationFee = "None" // to be updated with last ternoa sdk version : replace "None" by CancellationFeeAction.None
      record.renteeCancellationFeeValue = null
      record.renteeCancellationFeeValueRounded = null
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
  await nftOperationEntityHandler(nftRecord, record.renter, commonEventData, "rentalContractCreated", [
    record.duration,
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
  if (record.duration === DurationAction.Subscription) {
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
  await nftOperationEntityHandler(nftRecord, record.renter, commonEventData, "rentalContractStarted", [
    record.startBlockId,
    record.duration,
    record.blockDuration,
    record.maxSubscriptionBlockDuration,
    record.rentFee,
    record.rentFeeValue,
    record.rentFeeValueRounded,
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
  record.totalRentOffersRecieived = record.totalRentOffersRecieived + 1
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
  record.rentFeeValue = bnToBn(rentFee.toString()).toString()
  record.rentFeeValueRounded = roundPrice(record.rentFeeValue)
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
  await nftOperationEntityHandler(nftRecord, record.renter, commonEventData, "rentalContractCanceled")
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
  await nftOperationEntityHandler(nftRecord, record.revokedBy, commonEventData, "rentalContractRevoked")
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
  await nftOperationEntityHandler(nftRecord, record.revokedBy, commonEventData, "rentalContractEnded")
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
  await nftOperationEntityHandler(nftRecord, null, commonEventData, "rentalContractExpired")
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
  record.nbSubscriptionRenewal = lastBlockRenewal >= nextBlockRenewal ? record.nbSubscriptionRenewal + 1 : record.nbSubscriptionRenewal
  record.nextSubscriptionRenewalBlockId = lastBlockRenewal >= nextBlockRenewal ? nextBlockRenewal : lastBlockRenewal
  record.timestampLastSubscriptionRenewal = commonEventData.timestamp
  await record.save()
}
