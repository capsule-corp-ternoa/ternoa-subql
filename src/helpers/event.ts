import { SubstrateEvent, SubstrateExtrinsic } from "@subql/types"

export type CommonEventData = {
  blockId: string
  blockHash: string
  extrinsicId: string
  eventId: string
  isSuccess: boolean
  isBatch: boolean
  isBatchAll: boolean
  timestamp: Date
}

export const getSigner = (event: SubstrateEvent): string => {
  if (!event.extrinsic) throw new Error("Extrinsic (for signer) was not found")
  return event.extrinsic.extrinsic.signer.toString()
}

export const getCommonEventData = (event: SubstrateEvent): CommonEventData => {
  const isSuccess = isEventSuccess(event)
  const blockId = event.block.block.header.number.toString()
  const blockHash = event.block.block.hash.toString()
  const extrinsicId = event.phase.isApplyExtrinsic ? `${blockId}-${event.phase.asApplyExtrinsic.toString()}` : ""
  const eventId = event.idx.toString()
  const isBatch = event.extrinsic ? checkIfBatch(event.extrinsic) : false
  const isBatchAll = event.extrinsic ? checkIfBatchAll(event.extrinsic) : false
  const timestamp = event.block.timestamp
  return {
    blockId,
    blockHash,
    extrinsicId,
    eventId,
    isSuccess,
    isBatch,
    isBatchAll,
    timestamp,
  }
}

export const checkIfTransfer = (extrinsic: SubstrateExtrinsic): boolean => {
  const { section, method } = extrinsic.extrinsic.method
  if (section === "balances" && ["transfer", "transferAll", "transferKeepAlive"].includes(method)) return true
  return false
}

export const checkIfAnyBatch = (extrinsic: SubstrateExtrinsic): boolean => {
  const { section, method } = extrinsic.extrinsic.method
  if (section === "utility" && ["batch", "batchAll", "forceBatch"].includes(method)) return true
  return false
}

const checkIfBatch = (extrinsic: SubstrateExtrinsic): boolean => {
  const { section, method } = extrinsic.extrinsic.method
  if (section === "utility" && method === "batch") return true
  return false
}

const checkIfBatchAll = (extrinsic: SubstrateExtrinsic): boolean => {
  const { section, method } = extrinsic.extrinsic.method
  if (section === "utility" && method === "batchAll") return true
  return false
}

const checkEventSuccessInBatch = (event: SubstrateEvent): boolean => {
  const extrinsic = event.extrinsic
  const extrinsicEvents = extrinsic.events
  const batchInterruptedIndex = extrinsicEvents.findIndex(
    (item) => item.event.method === "BatchInterrupted" && item.event.section === "utility",
  )
  if (batchInterruptedIndex === -1) return true
  return event.idx < batchInterruptedIndex
}

const checkEventSuccessInBatchAll = (event: SubstrateEvent): boolean => {
  const extrinsic = event.extrinsic
  const extrinsicEvents = extrinsic.events
  const isSuccess =
    extrinsicEvents.findIndex((item) => item.event.method === "ExtrinsicSuccess" && item.event.section === "system") !==
    -1
  const isBatchCompleted =
    extrinsicEvents.findIndex((item) => item.event.method === "BatchCompleted" && item.event.section === "utility") !==
    -1
  return isSuccess && isBatchCompleted
}

const isEventSuccess = (event: SubstrateEvent): boolean => {
  if (event.extrinsic) {
    const extrinsic = event.extrinsic
    const extrinsicEvents = extrinsic.events
    const isBatch = checkIfBatch(extrinsic)
    const isBatchAll = checkIfBatchAll(extrinsic)
    if (isBatch) {
      return checkEventSuccessInBatch(event)
    } else if (isBatchAll) {
      return checkEventSuccessInBatchAll(event)
    } else {
      return (
        extrinsicEvents.findIndex(
          (item) => item.event.method === "ExtrinsicSuccess" && item.event.section === "system",
        ) !== -1
      )
    }
  } else {
    // it's a system event, so it's ok
    return true
  }
}
