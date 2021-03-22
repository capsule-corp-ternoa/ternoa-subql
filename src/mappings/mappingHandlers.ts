import {SubstrateExtrinsic,SubstrateEvent} from "@subql/types";
import {SubstrateBlock} from "@subql/types";
import { ExtrinsicDispatcher } from '../dispatchers'
import {
    transferHandler,
    listHandler,
} from '../handlers'

export async function handleBlock(block: SubstrateBlock): Promise<void> {
}


export async function handleEvent(event: SubstrateEvent): Promise<void> {
}

const extrinsicDispatcher = new ExtrinsicDispatcher()

// apply extrinsic handler
extrinsicDispatcher.add('balances', 'transfer', transferHandler)
extrinsicDispatcher.add('marketplace', 'create', listHandler)

export async function handleCall(extrinsic: SubstrateExtrinsic): Promise<void> {
    await extrinsicDispatcher.emit(extrinsic)
}

