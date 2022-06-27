import { SubstrateEvent } from "@subql/types"
import { getCommonEventData } from "../helpers";

export const marketplaceCreatedHandler = async (event: SubstrateEvent): Promise<void> => {
   const commonEventData = getCommonEventData(event)
   if (!commonEventData.isSuccess) throw new Error("Marketplace created error, extrinsic isSuccess : false")
   const date = new Date()
}

export const marketplaceOwnerSetHandler = async (event: SubstrateEvent): Promise<void> => {
 //todo
}

export const marketplaceKindSetHandler = async (event: SubstrateEvent): Promise<void> => {
 //todo
}

export const marketplaceConfigSetHandler = async (event: SubstrateEvent): Promise<void> => {
 //todo
}

export const marketplaceMintFeeSetHandler = async (event: SubstrateEvent): Promise<void> => {
 //todo
}

export const nftListedHandler = async (event: SubstrateEvent): Promise<void> => {
 //todo
}

export const nftUnlistedHandler = async (event: SubstrateEvent): Promise<void> => {
 //todo
}

export const nftSoldHandler = async (event: SubstrateEvent): Promise<void> => {
 //todo
}