import { SubstrateEvent } from "@subql/types"
import { ProtocolAction, TransmissionCancellationAction } from "ternoa-js/protocols/enums"
import { Protocols, TransmissionCancellation } from "ternoa-js/protocols/types"

import { getCommonEventData, getSigner } from "../helpers"
import { getLastTransmission } from "../helpers/transmission"
import { NftEntity, TransmissionEntity } from "../types"

import { NFTOperation, nftOperationEntityHandler } from "./nftOperations"

export const protocolSetHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess) throw new Error("Transmission protocol creation error, extrinsic isSuccess : false")
  const [nftId, recipient, protocolKind, cancellationKind] = event.event.data

  const transmissionId = commonEventData.blockId + "-" + nftId.toString()
  const signer = getSigner(event)
  const parsedProtocol = protocolKind.toJSON() as Protocols
  const protocol = Object.keys(parsedProtocol)[0]
  const parsedCancellation = cancellationKind.toJSON() as TransmissionCancellation
  const cancellation = Object.keys(parsedCancellation)[0]
  const cancellationBlock = parsedCancellation[cancellation]
  const isActive = true
  const isThresholdReached = false
  const createdAt = commonEventData.timestamp
  const updatedAt = commonEventData.timestamp
  const timestampCreated = commonEventData.timestamp

  let consentList = null
  let currentConsent = null
  let endBlock = null
  let threshold = null
  switch (protocol) {
    case ProtocolAction.AtBlock:
    case ProtocolAction.AtBlockWithReset:
      endBlock = parsedProtocol[protocol]
      break
    case ProtocolAction.OnConsent:
      consentList = parsedProtocol[protocol]["consentList"]
      currentConsent = []
      threshold = parsedProtocol[protocol]["threshold"]
      break
    case ProtocolAction.OnConsentAtBlock:
      consentList = parsedProtocol[protocol]["consentList"]
      currentConsent = []
      endBlock = parsedProtocol[protocol]["block"]
      threshold = parsedProtocol[protocol]["threshold"]
      break
    default:
      break
  }

  const record = new TransmissionEntity(
    transmissionId,
    nftId.toString(),
    signer,
    recipient.toString(),
    isActive,
    isThresholdReached,
    protocol,
    createdAt,
    updatedAt,
    timestampCreated,
  )

  record.consentList = consentList
  record.currentConsent = currentConsent
  record.endBlock = endBlock
  record.threshold = threshold
  record.cancellation = cancellation === TransmissionCancellationAction.None ? null : cancellation
  record.cancellationBlock = cancellationBlock
  record.timestampRemoved = null
  record.timestampUpdated = null
  record.timestampTransmitted = null

  await record.save()

  // Side Effects on NftEntity
  const nftRecord = await NftEntity.get(nftId.toString())
  if (nftRecord === undefined)
    throw new Error("NFT record not found in db for when setting a new transmission protocol")
  nftRecord.isTransmission = record.isActive
  nftRecord.transmissionRecipient = record.to
  nftRecord.transmissionProtocolId = transmissionId
  nftRecord.updatedAt = commonEventData.timestamp
  await nftRecord.save()

  // Side Effects on NftOperationEntity
  await nftOperationEntityHandler(nftRecord, record.from, commonEventData, NFTOperation.TransmissionProtocolSet, [
    record.protocol,
    record.endBlock,
    record.to,
  ])
}

export const protocolRemovedHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess) throw new Error("Transmission protocol removed error, extrinsic isSuccess : false")
  const [nftId] = event.event.data
  const record = await getLastTransmission(nftId.toString())
  if (record === undefined) throw new Error("Transmission not found in db")
  record.isActive = false
  record.updatedAt = commonEventData.timestamp
  record.timestampRemoved = commonEventData.timestamp
  record.timestampUpdated = commonEventData.timestamp

  await record.save()

  // Side Effects on NftEntity
  const nftRecord = await NftEntity.get(nftId.toString())
  if (nftRecord === undefined) throw new Error("NFT record not found in db for when removing transmission protocol")
  nftRecord.isTransmission = record.isActive
  nftRecord.transmissionRecipient = null
  nftRecord.transmissionProtocolId = null
  nftRecord.updatedAt = commonEventData.timestamp
  await nftRecord.save()

  // Side Effects on NftOperationEntity
  await nftOperationEntityHandler(nftRecord, record.from, commonEventData, NFTOperation.TransmissionProtocolRemoved)
}

export const timerResetHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess) throw new Error("Transmission protocol timer set error, extrinsic isSuccess : false")
  const [nftId, newEndBlockId] = event.event.data
  const record = await getLastTransmission(nftId.toString())
  if (record === undefined) throw new Error("Transmission not found in db")
  record.endBlock = Number(newEndBlockId.toString())
  record.updatedAt = commonEventData.timestamp
  record.timestampUpdated = commonEventData.timestamp

  await record.save()

  const nftRecord = await NftEntity.get(nftId.toString())

  // Side Effects on NftOperationEntity
  await nftOperationEntityHandler(nftRecord, record.from, commonEventData, NFTOperation.TransmissionTimerReset, [
    record.protocol,
    record.endBlock,
  ])
}

export const consentAddedHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess)
    throw new Error("Transmission protocol consent added error, extrinsic isSuccess : false")
  const [nftId, from] = event.event.data
  const consentFrom = from.toString()
  const record = await getLastTransmission(nftId.toString())
  if (record === undefined) throw new Error("Transmission not found in db")
  record.currentConsent = record.currentConsent ? [...record.currentConsent, consentFrom] : [consentFrom]
  record.updatedAt = commonEventData.timestamp
  record.timestampUpdated = commonEventData.timestamp

  await record.save()

  const nftRecord = await NftEntity.get(nftId.toString())

  // Side Effects on NftOperationEntity
  await nftOperationEntityHandler(nftRecord, consentFrom, commonEventData, NFTOperation.TransmissionConsentAdded, [
    record.protocol,
    record.endBlock,
  ])
}

export const thresholdReachedHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess)
    throw new Error("Transmission protocol threshold reach error, extrinsic isSuccess : false")
  const [nftId] = event.event.data
  const record = await getLastTransmission(nftId.toString())
  if (record === undefined) throw new Error("Transmission not found in db")
  record.isThresholdReached = true
  record.updatedAt = commonEventData.timestamp
  record.timestampUpdated = commonEventData.timestamp
  await record.save()

  const nftRecord = await NftEntity.get(nftId.toString())

  // Side Effects on NftOperationEntity
  await nftOperationEntityHandler(nftRecord, null, commonEventData, NFTOperation.TransmissionThresholdReached, [
    record.protocol,
    record.endBlock,
  ])
}

export const transmittedHandler = async (event: SubstrateEvent): Promise<void> => {
  const commonEventData = getCommonEventData(event)
  if (!commonEventData.isSuccess)
    throw new Error("Transmission protocol NFT transmission error, extrinsic isSuccess : false")
  const [nftId] = event.event.data
  const record = await getLastTransmission(nftId.toString())
  if (record === undefined) throw new Error("Transmission not found in db")
  record.isActive = false
  record.updatedAt = commonEventData.timestamp
  record.timestampUpdated = commonEventData.timestamp
  record.timestampTransmitted = commonEventData.timestamp
  await record.save()

  // Side Effects on NftEntity
  const nftRecord = await NftEntity.get(nftId.toString())
  if (nftRecord === undefined) throw new Error("NFT record not found in db for transmittion")
  nftRecord.isTransmission = record.isActive
  nftRecord.transmissionRecipient = null
  nftRecord.transmissionProtocolId = null
  nftRecord.owner = record.to
  nftRecord.updatedAt = commonEventData.timestamp
  await nftRecord.save()

  // Side Effects on NftOperationEntity
  await nftOperationEntityHandler(nftRecord, record.from, commonEventData, NFTOperation.Transmitted, [record.protocol])
}
