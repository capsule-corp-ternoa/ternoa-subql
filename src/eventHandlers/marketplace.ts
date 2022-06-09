import { SubstrateEvent } from "@subql/types";
import { Balance } from '@polkadot/types/interfaces';
import { genericTransferHandler, nftOperationEntityHandler,  } from ".";
import { formatString, getCommonEventData, roundPrice } from "../helpers";
import { MarketplaceEntity, NftEntity } from "../types";

export const DEFAULT_MARKETPLACE_CREATION_FEE = "10000000000000000000000"

export const createGenesisMarketplace = async () => {
  const date = new Date();
  let record = await MarketplaceEntity.get("0");
  if (!record) {
    record = new MarketplaceEntity("0");
    await api.query.marketplace.marketplaces(
      0,
      async (marketplaceInformation: any) => {
        try {
          const { kind, commission_fee, owner, name, uri, logo_uri } = JSON.parse(JSON.stringify(marketplaceInformation));
          record.kind = kind.toString();
          record.name = formatString(name.toString());
          record.commissionFee = commission_fee.toString();
          record.owner = owner.toString();
          if (uri) record.uri = formatString(uri.toString());
          if (logo_uri) record.logoUri = formatString(logo_uri.toString());
          record.allowList = [];
          record.disallowList = [];
          record.createdAt = date;
          record.updatedAt = date;
          await record.save();
        } catch (err) {
          throw err;
        }
      }
    );
  }
};

export const marketplaceCreatedHandler = async (event: SubstrateEvent): Promise<void> => {
    const commonEventData = getCommonEventData(event)
    if (!commonEventData.isSuccess) throw new Error("Marketplace created error, extrinsic isSuccess : false")
    const [mpId, owner] = event.event.data;
    const date = new Date()
    //TODO
    if (!event.extrinsic) throw new Error("Marketplace created error, extrinsic (for kind, commissionFee, name, uri, logoUri, description) was not found")
    const [kind, commissionFee, name, uri, logoUri, description, fee] = event.extrinsic.extrinsic.args
    const record = new MarketplaceEntity(mpId.toString())
    if (record.id === "1") await createGenesisMarketplace()
    record.kind = kind.toString()
    record.name = formatString(name.toString())
    record.commissionFee = commissionFee.toString()
    record.owner = owner.toString()
    if (uri) record.uri = formatString(uri.toString())
    if (logoUri) record.logoUri = formatString(logoUri.toString())
    if (description) record.description = formatString(description.toString())
    record.allowList = []
    record.disallowList = []
    record.createdAt = date
    record.updatedAt = date
    await record.save()
    await genericTransferHandler(owner, 'Treasury', fee ? fee : DEFAULT_MARKETPLACE_CREATION_FEE, commonEventData)
}

export const marketplaceCommissionFeeChangedHandler = async (event: SubstrateEvent): Promise<void> => {
    const commonEventData = getCommonEventData(event)
    if (!commonEventData.isSuccess) throw new Error("Marketplace commission fee changed error, extrinsic isSuccess : false")
    const [mpId, value] = event.event.data;
    const date = new Date()
    const record = await MarketplaceEntity.get(mpId.toString());
    if (record === undefined) throw new Error("Marketplace not found in db")
    record.commissionFee = value.toString()
    record.updatedAt = date
    await record.save()
}

export const marketplaceDescriptionChangedHandler = async (event: SubstrateEvent): Promise<void> => {
    const commonEventData = getCommonEventData(event)
    if (!commonEventData.isSuccess) throw new Error("Marketplace description changed error, extrinsic isSuccess : false")
    const [mpId, value] = event.event.data;
    const date = new Date()
    const record = await MarketplaceEntity.get(mpId.toString());
    if (record === undefined) throw new Error("Marketplace not found in db")
    record.description = formatString(value.toString())
    record.updatedAt = date
    await record.save()
}

export const marketplaceLogoUriChangedHandler = async (event: SubstrateEvent): Promise<void> => {
    const commonEventData = getCommonEventData(event)
    if (!commonEventData.isSuccess) throw new Error("Marketplace logo uri changed error, extrinsic isSuccess : false")
    const [mpId, value] = event.event.data;
    const date = new Date()
    const record = await MarketplaceEntity.get(mpId.toString());
    if (record === undefined) throw new Error("Marketplace not found in db")
    record.logoUri = formatString(value.toString())
    record.updatedAt = date
    await record.save()
}

export const marketplaceTypeChangedHandler = async (event: SubstrateEvent): Promise<void> => {
    const commonEventData = getCommonEventData(event)
    if (!commonEventData.isSuccess) throw new Error("Marketplace logo uri changed error, extrinsic isSuccess : false")
    const [mpId, value] = event.event.data;
    const date = new Date()
    const record = await MarketplaceEntity.get(mpId.toString());
    if (record === undefined) throw new Error("Marketplace not found in db")
    record.kind = value.toString()
    record.updatedAt = date
    await record.save()
}

export const marketplaceNameChangedHandler = async (event: SubstrateEvent): Promise<void> => {
    const commonEventData = getCommonEventData(event)
    if (!commonEventData.isSuccess) throw new Error("Marketplace name changed error, extrinsic isSuccess : false")
    const [mpId, value] = event.event.data;
    const date = new Date()
    const record = await MarketplaceEntity.get(mpId.toString());
    if (record === undefined) throw new Error("Marketplace not found in db")
    record.name = formatString(value.toString())
    record.updatedAt = date
    await record.save()
}

export const marketplaceOwnerChangedHandler = async (event: SubstrateEvent): Promise<void> => {
    const commonEventData = getCommonEventData(event)
    if (!commonEventData.isSuccess) throw new Error("Marketplace owner changed error, extrinsic isSuccess : false")
    const [mpId, value] = event.event.data;
    const date = new Date()
    const record = await MarketplaceEntity.get(mpId.toString());
    if (record === undefined) throw new Error("Marketplace not found in db")
    record.owner = value.toString()
    record.updatedAt = date
    await record.save()
}

export const marketplaceUriChangedHandler = async (event: SubstrateEvent): Promise<void> => {
    const commonEventData = getCommonEventData(event)
    if (!commonEventData.isSuccess) throw new Error("Marketplace uri changed error, extrinsic isSuccess : false")
    const [mpId, value] = event.event.data;
    const date = new Date()
    const record = await MarketplaceEntity.get(mpId.toString());
    if (record === undefined) throw new Error("Marketplace not found in db")
    record.uri = formatString(value.toString())
    record.updatedAt = date
    await record.save()
}

export const marketplaceNftSoldHandler = async (event: SubstrateEvent): Promise<void> => {
    const commonEventData = getCommonEventData(event)
    if (!commonEventData.isSuccess) throw new Error("NFT sold error, extrinsic isSuccess : false")
    const [nftId, buyer] = event.event.data;
    const date = new Date()
    const record = await NftEntity.get(nftId.toString());
    if (record === undefined) throw new Error("NFT not found in db")
    const oldOwner = record.owner
    const price = record.price
    const marketplaceId = record.marketplaceId
    record.owner = buyer.toString();
    record.listed = 0;
    record.marketplaceId = null;
    record.isLocked = false;
    record.price = '';
    record.priceRounded = null;
    record.updatedAt = date
    await record.save()
    await nftOperationEntityHandler(record, oldOwner, commonEventData, "sale", price, marketplaceId)
}

export const marketplaceNftListedHandler = async (event: SubstrateEvent): Promise<void> => {
    const commonEventData = getCommonEventData(event)
    if (!commonEventData.isSuccess) throw new Error("NFT listed error, extrinsic isSuccess : false")
    const [nftId, amount, mpId] = event.event.data;
    const date = new Date()
    const record = await NftEntity.get(nftId.toString());
    if (record === undefined) throw new Error("NFT not found in db")
    record.listed = 1;
    record.isLocked = true;
    record.timestampList = commonEventData.timestamp;
    record.price = (amount as Balance).toBigInt().toString();;
    record.priceRounded = roundPrice(record.price);
    record.marketplaceId = mpId.toString()
    record.updatedAt = date
    await record.save()
}

export const marketplaceNftUnlistedHandler = async (event: SubstrateEvent): Promise<void> => {
    const commonEventData = getCommonEventData(event)
    if (!commonEventData.isSuccess) throw new Error("NFT unlisted error, extrinsic isSuccess : false")
    const [nftId] = event.event.data;
    const date = new Date()
    const record = await NftEntity.get(nftId.toString());
    if (record === undefined) throw new Error("NFT not found in db")
    record.listed = 0;
    record.isLocked = false;
    record.timestampList = null;
    record.price = ""
    record.priceRounded = null
    record.marketplaceId = null;
    record.updatedAt = date
    await record.save()
}

export const accountAddedToAllowListHandler = async (event: SubstrateEvent): Promise<void> => {
    const commonEventData = getCommonEventData(event)
    if (!commonEventData.isSuccess) throw new Error("Marketplace account added to allow list error, extrinsic isSuccess : false")
    const [mpId, accountId] = event.event.data;
    const date = new Date()
    const record = await MarketplaceEntity.get(mpId.toString());
    if (record === undefined) throw new Error("Marketplace not found in db")
    record.allowList.push(accountId.toString())
    record.updatedAt = date
    await record.save()
}

export const accountAddedToDisallowListHandler = async (event: SubstrateEvent): Promise<void> => {
    const commonEventData = getCommonEventData(event)
    if (!commonEventData.isSuccess) throw new Error("Marketplace account added to disallow list error, extrinsic isSuccess : false")
    const [mpId, accountId] = event.event.data;
    const date = new Date()
    const record = await MarketplaceEntity.get(mpId.toString());
    if (record === undefined) throw new Error("Marketplace not found in db")
    record.disallowList.push(accountId.toString())
    record.updatedAt = date
    await record.save()
}

export const accountRemovedFromDisallowListHandler = async (event: SubstrateEvent): Promise<void> => {
    const commonEventData = getCommonEventData(event)
    if (!commonEventData.isSuccess) throw new Error("Marketplace account removed from disallow list error, extrinsic isSuccess : false")
    const [mpId, accountId] = event.event.data;
    const date = new Date()
    const record = await MarketplaceEntity.get(mpId.toString());
    if (record === undefined) throw new Error("Marketplace not found in db")
    const firstIndex = record.disallowList.indexOf(accountId.toString())
    if (firstIndex !== -1){
      record.disallowList.filter((_x: string,i: number) => i !== firstIndex)
      record.updatedAt = date
      await record.save()
    }
}

export const accountRemovedFromAllowListHandler = async (event: SubstrateEvent): Promise<void> => {
    const commonEventData = getCommonEventData(event)
    if (!commonEventData.isSuccess) throw new Error("Marketplace account removed from allow list error, extrinsic isSuccess : false")
    const [mpId, accountId] = event.event.data;
    const date = new Date()
    const record = await MarketplaceEntity.get(mpId.toString());
    if (record === undefined) throw new Error("Marketplace not found in db")
    const firstIndex = record.allowList.indexOf(accountId.toString())
    if (firstIndex !== -1){
      record.allowList.filter((_x: string,i: number) => i !== firstIndex)
      record.updatedAt = date
      await record.save()
    }
}