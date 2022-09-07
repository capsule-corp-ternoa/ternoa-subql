import { SubstrateEvent } from "@subql/types"
import { bnToBn } from "@polkadot/util/bn"
import {
  AcceptanceAction,
  CancellationFeeAction,
  DurationAction,
  RentFeeAction,
  RevocationAction,
} from "ternoa-js/rent/enum"

import { nftOperationEntityHandler } from "./nftTransfer"
import { getCommonEventData, roundPrice } from "../helpers"
import { NftEntity, RentEntity } from "../types"

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

  let nftRecord = await NftEntity.get(nftId.toString())
  if (nftRecord === undefined) throw new Error("NFT record found in db for when creating rental contract")
  nftRecord.isRented = true
  await nftRecord.save()

  let record = await RentEntity.get(nftId.toString())
  if (record === undefined) {
    record = new RentEntity(nftId.toString())
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
    // await nftOperationEntityHandler(record, null, commonEventData, "RentContractCreated")
  }
}
