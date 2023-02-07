import { bnToBn } from "@polkadot/util/bn"
import { IFeeType } from "ternoa-js/marketplace/types"

import { RequireOnlyOne } from "../genericTypes"
import { MarketplaceEntity } from "../types"
import { formatString, roundPrice } from "./common"

type FeeType = {
  fee: string | null
  feeRounded: number | null
  kind: string | null
}

export const parseConfigSetFee = (
  record: MarketplaceEntity,
  key: "commission" | "listing",
  rawFee: { [key: string]: RequireOnlyOne<IFeeType> | null },
) => {
  const action = Object.keys(rawFee)[0]
  switch (action) {
    case "set":
      const { fee, feeRounded, kind } = parseFee(rawFee[action])
      record[`${key}Fee`] = fee
      record[`${key}FeeRounded`] = feeRounded
      record[`${key}FeeType`] = kind
      break
    case "remove":
      record[`${key}Fee`] = null
      record[`${key}FeeRounded`] = null
      record[`${key}FeeType`] = null
      break
    default:
      break
  }
}

export const parseList = (
  record: MarketplaceEntity,
  key: "account" | "collection",
  rawSet: { [key: string]: string[] | null },
) => {
  const action = Object.keys(rawSet)[0]
  switch (action) {
    case "set":
    case "remove":
      record[`${key}List`] = rawSet[action]
      break
    default:
      break
  }
}

export const parseOffchainData = (record: MarketplaceEntity, rawSet: { [key: string]: string | null }) => {
  const action = Object.keys(rawSet)[0]
  switch (action) {
    case "set":
    case "remove":
      record.offchainData = rawSet[action] && formatString(rawSet[action])
      break
    default:
      break
  }
}

export const parseFee = (rawFee: RequireOnlyOne<IFeeType>): FeeType => {
  let fee = "0"
  let feeRounded = 0
  const kind = Object.keys(rawFee)[0]
  logger.info(kind)
  if (kind === "percentage") {
    fee = String(rawFee[kind] / 10000)
    logger.info(fee)
    feeRounded = Number(fee)
    logger.info(feeRounded)
  } else if (kind === "flat") {
    fee = bnToBn(rawFee[kind]).toString()
    logger.info(fee)
    feeRounded = roundPrice(fee)
    logger.info(feeRounded)
  }
  return { fee, feeRounded, kind }
}
