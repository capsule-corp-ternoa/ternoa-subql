import { SubstrateEvent } from '@subql/types'
import { updateAccount, getCommonEventData, formatString } from '../helpers'
import { NftEntity, SerieEntity } from '../types';
import { genericTransferHandler, nftTransferEntityHandler } from '.';

export const DEFAULT_NFT_CREATION_FEE = "10000000000000000000"

export const nftsCreatedHandler = async (event: SubstrateEvent): Promise<void> => {
    const commonEventData = getCommonEventData(event)
    if (!commonEventData.isSuccess) throw new Error("NFT created error, extrinsic isSuccess : false")
    const [nftId, owner, seriesId, nftIpfs, mintFee] = event.event.data;
    const record = new NftEntity(nftId.toString())
    const eventId = event.idx.toString()
    let date = new Date()
    const correctMintFee = mintFee ? mintFee : DEFAULT_NFT_CREATION_FEE
    let seriesString = formatString(seriesId.toString())
    let serieRecord = await SerieEntity.get(seriesString)
    if (!serieRecord){
      serieRecord = new SerieEntity(seriesString)
      serieRecord.owner = owner.toString()
      serieRecord.locked = false
      serieRecord.createdAt = date
      serieRecord.updatedAt = date
      await serieRecord.save()
    }
    record.currency = 'CAPS';
    record.listed = 0;
    record.isLocked = false;
    record.owner = owner.toString();
    record.serieId = serieRecord.id;
    record.creator = owner.toString();
    record.nftId = nftId.toString();
    record.nftIpfs = formatString(nftIpfs.toString())
    record.isCapsule = false;
    record.frozenCaps = "0";
    record.timestampCreate = commonEventData.timestamp
    record.createdAt = date
    record.updatedAt = date
    await record.save()
    await nftTransferEntityHandler(record, "null address", commonEventData, "creation")
    await genericTransferHandler(eventId, owner, 'Treasury', correctMintFee, commonEventData)
    await updateAccount(owner.toString());
}

export const nftsBurnedHandler = async (event: SubstrateEvent): Promise<void> => {
    const commonEventData = getCommonEventData(event)
    if (!commonEventData.isSuccess) throw new Error("NFT burned error, extrinsic isSuccess : false")
    const [nftId] = event.event.data;
    let date = new Date()
    const record = await NftEntity.get(nftId.toString());
    if (record === undefined) throw new Error("NFT to burn not found in db")
    const oldOwner = record.owner
    record.listed = 0
    record.marketplaceId = null
    record.owner = "null address"
    record.timestampBurn = commonEventData.timestamp
    record.updatedAt = date
    await record.save()
    await nftTransferEntityHandler(record, oldOwner, commonEventData, "burn")
    await updateAccount(oldOwner);
}

export const nftsTransferHandler = async (event: SubstrateEvent): Promise<void> => {
    const commonEventData = getCommonEventData(event)
    if (!commonEventData.isSuccess) throw new Error("NFT transfer error, extrinsic isSuccess : false")
    const [nftId, from, to] = event.event.data;
    let date = new Date()
    const record = await NftEntity.get(nftId.toString());
    if (record === undefined) throw new Error("NFT to transfer not found in db")
    record.listed = 0
    record.marketplaceId = null
    record.owner = to.toString()
    record.updatedAt = date
    await record.save()
    await nftTransferEntityHandler(record, from.toString(), commonEventData, "transfer")
    await updateAccount(from.toString());
}

export const nftsSeriesFinishedHandler = async (event: SubstrateEvent): Promise<void> => {
    const commonEventData = getCommonEventData(event)
    if (!commonEventData.isSuccess) throw new Error("NFT series finished error, extrinsic isSuccess : false")
    const [seriesId] = event.event.data;
    let date = new Date()
    let record = await SerieEntity.get(seriesId.toString());
    if (record === undefined) record = await SerieEntity.get(formatString(seriesId.toString()));
    if (record === undefined) throw new Error("Series to finish not found in db")
    const signer = event.extrinsic ? event.extrinsic.extrinsic.signer.toString() : undefined
    record.locked = true
    record.updatedAt = date
    await record.save()
    if (signer) await updateAccount(signer.toString());
}