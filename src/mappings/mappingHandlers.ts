import {SubstrateExtrinsic,SubstrateEvent} from "@subql/types";
import {SubstrateBlock} from "@subql/types";
import { ExtrinsicDispatcher } from '../dispatchers'
import {
    transferHandler,
    transferTiimeHandler,
    listHandler,
    createHandler,
    burnHandler,
    buyHandler,
} from '../handlers'

export async function handleBlock(block: SubstrateBlock): Promise<void> {
}


export async function handleEvent(event: SubstrateEvent): Promise<void> {
}

const extrinsicDispatcher = new ExtrinsicDispatcher()

// apply extrinsic handler
extrinsicDispatcher.add('balances', 'transfer', transferHandler)
extrinsicDispatcher.add('balances', 'transferKeepAlive', transferHandler)
extrinsicDispatcher.add('tiimeBalances', 'transfer', transferTiimeHandler)
extrinsicDispatcher.add('tiimeBalances', 'transferKeepAlive', transferTiimeHandler)
extrinsicDispatcher.add('nfts', 'create', createHandler)
extrinsicDispatcher.add('nfts', 'burn', burnHandler)
extrinsicDispatcher.add('marketplace', 'list', listHandler)
extrinsicDispatcher.add('marketplace', 'buy', buyHandler)

export async function handleCall(extrinsic: SubstrateExtrinsic): Promise<void> {
    await extrinsicDispatcher.emit(extrinsic)
}

