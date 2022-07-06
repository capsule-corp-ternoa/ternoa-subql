import BN from "bn.js"
import { formatBalance } from "@polkadot/util"

type AnyFunction = <T extends unknown[], R extends unknown>(args?: T) => R | Promise<R>

export function tcWrapper<F extends AnyFunction>(fn: F) {
  return ((...args) => {
    try {
      return fn.apply(this, args)
    } catch (e) {
      console.log(e)
    }
  }) as F
}

export const isHex = (str: string) => {
  if (str.length > 1 && str.substring(0, 2) === "0x") {
    return /^[A-F0-9]+$/i.test(str.substring(2))
  } else {
    return /^[A-F0-9]+$/i.test(str)
  }
}

export const isNumeric = (str: string) => {
  if (typeof str != "string") return false
  return !isNaN(str as unknown as number) && !isNaN(parseFloat(str))
}

export const hexToString = (hexToConvert: string) => {
  var hex = hexToConvert.toString()
  var str = ""
  for (var n = 0; n < hex.length; n += 2) {
    str += String.fromCharCode(parseInt(hex.substring(n, n + 2), 16))
  }
  return str
}

export const formatString = (str: string) => {
  let result = str
  let startWith0X = false
  if (str.length > 1 && str.substring(0, 2) === "0x") {
    result = str.substring(2)
    startWith0X = true
  }
  if (isNumeric(result) && !startWith0X) return result
  if (isHex(result) && startWith0X) result = hexToString(result)
  return result
}

export const roundPrice = (input : string) => {
  const inputBN = new BN(input)
	formatBalance.setDefaults({ decimals: 18, unit: "CAPS" })
  return Number(formatBalance(inputBN, { forceUnit: "-", withUnit: false }).split(",").join(""))
}