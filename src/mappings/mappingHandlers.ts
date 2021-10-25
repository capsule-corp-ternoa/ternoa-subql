import {SubstrateExtrinsic,SubstrateEvent} from "@subql/types";
import {SubstrateBlock} from "@subql/types";
import { ExtrinsicDispatcher } from '../dispatchers'
import {
    transferHandler,
    transferTiimeHandler,
    listHandler,
    unlistHandler,
    createHandler,
    burnHandler,
    buyHandler,
    NFTtransferHandler,
    blockHandler,
    genericExtrinsicHandler,
    genericEventHandler,
} from '../handlers'

// init and populate extrinsicDispatcher for specific extrinsic to record
const extrinsicDispatcher = new ExtrinsicDispatcher()
extrinsicDispatcher.add('balances', 'transfer', transferHandler)
extrinsicDispatcher.add('balances', 'transferKeepAlive', transferHandler)
extrinsicDispatcher.add('tiimeBalances', 'transfer', transferTiimeHandler)
extrinsicDispatcher.add('tiimeBalances', 'transferKeepAlive', transferTiimeHandler)
extrinsicDispatcher.add('nfts', 'create', createHandler)
extrinsicDispatcher.add('nfts', 'burn', burnHandler)
extrinsicDispatcher.add('nfts', 'transfer', NFTtransferHandler)
extrinsicDispatcher.add('marketplace', 'list', listHandler)
extrinsicDispatcher.add('marketplace', 'unlist', unlistHandler)
extrinsicDispatcher.add('marketplace', 'buy', buyHandler)

export async function handleBlock(block: SubstrateBlock): Promise<void> {
    await blockHandler(block)
}

export async function handleCall(extrinsic: SubstrateExtrinsic): Promise<void> {
    await genericExtrinsicHandler(extrinsic)
    extrinsicDispatcher.emit(extrinsic)
}

export async function handleEvent(event: SubstrateEvent): Promise<void> {
    genericEventHandler(event)
}
