import { SubstrateEvent } from '@subql/types'
import { Balance } from '@polkadot/types/interfaces';
import { getCommonEventData, formatString, getSigner } from '../helpers'
import { NftEntity, SerieEntity } from '../types';
import { genericTransferHandler } from '.';

export const capsulesCreatedHandler = async (event: SubstrateEvent): Promise<void> => {
    const commonEventData = getCommonEventData(event)
    if (!commonEventData.isSuccess) throw new Error("Capsule created error, extrinsic isSuccess : false")
    const [owner, nftId, balance] = event.event.data;
    //TODO
    if (!event.extrinsic) throw new Error("Capsule created error, extrinsic (for capsuleIpfs) was not found")
    const [_nftIpfs, _capsuleIpfs, _seriesId] = event.extrinsic.extrinsic.args
    logger.info("capsule data : " + JSON.stringify(event.extrinsic.extrinsic.args))
    const capsuleIpfs = formatString(_capsuleIpfs.toString())
    if (!(capsuleIpfs && capsuleIpfs.length > 0)) throw new Error("Capsule created error, capsuleIpfs not found")
    const record = await NftEntity.get(nftId.toString())
    if (record === undefined) throw new Error("NFT to convert to capsule not found in db")
    logger.info(JSON.stringify(record))
    const date = new Date()
    const serieRecord = await SerieEntity.get(record.serieId)
    if (serieRecord && serieRecord.locked === false){
      serieRecord.locked = true
      serieRecord.updatedAt = date
      await serieRecord.save()
    }
    record.capsuleIpfs = capsuleIpfs
    record.isLocked = true;
    record.isCapsule = true;
    record.frozenCaps = (balance as Balance).toBigInt().toString();
    record.updatedAt = date
    await record.save()
    await genericTransferHandler(owner, 'Capsule deposit', balance, commonEventData)
}

export const capsulesRemovedHandler = async (event: SubstrateEvent): Promise<void> => {
    const commonEventData = getCommonEventData(event)
    if (!commonEventData.isSuccess) throw new Error("Capsule removed error, extrinsic isSuccess : false")
    const signer = getSigner(event)
    const [nftId, balance] = event.event.data;
    const record = await NftEntity.get(nftId.toString())
    if (record === undefined) throw new Error("Capsule to revert to NFT not found in db")
    const date = new Date()
    record.capsuleIpfs = null
    record.isLocked = false;
    record.isCapsule = false;
    record.frozenCaps = "0"
    record.updatedAt = date
    await record.save()
    await genericTransferHandler("Capsule deposit returned", signer, balance, commonEventData)
}

export const capsulesFundsAddedHandler = async (event: SubstrateEvent): Promise<void> => {
    const commonEventData = getCommonEventData(event)
    if (!commonEventData.isSuccess) throw new Error("Capsule funds added error, extrinsic isSuccess : false")
    const signer = getSigner(event)
    const [nftId, balance] = event.event.data;
    const record = await NftEntity.get(nftId.toString())
    if (record === undefined) throw new Error("Capsule to add funds not found in db")
    const date = new Date()
    record.frozenCaps = (BigInt(record.frozenCaps) + (balance as Balance).toBigInt()).toString()
    record.updatedAt = date
    await record.save()
    await genericTransferHandler(signer, "Capsule add funds", balance, commonEventData)
}

export const capsulesIpfsReferenceChangedHandler = async (event: SubstrateEvent): Promise<void> => {
    const commonEventData = getCommonEventData(event)
    if (!commonEventData.isSuccess) throw new Error("Capsule set ipfs ref added error, extrinsic isSuccess : false")
    const [nftId, capsuleIpfs] = event.event.data;
    const record = await NftEntity.get(nftId.toString())
    if (record === undefined) throw new Error("Capsule to set ipfs ref not found in db")
    const date = new Date()
    record.capsuleIpfs = formatString(capsuleIpfs.toString())
    record.updatedAt = date
    await record.save()
}