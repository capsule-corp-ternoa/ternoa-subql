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
    convertToCapsuleHandler,
    convertToNftHandler,
    lockSerieHandler,
    blockHandler,
    genericExtrinsicHandler,
    genericEventHandler,
    createMarketplaceHandler,
    updateMarketplaceNameHandler,
    updateMarketplaceKindHandler,
    updateMarketplaceOwnerHandler,
    treasuryEventHandler2,
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
extrinsicDispatcher.add('marketplace', 'create', createMarketplaceHandler)
extrinsicDispatcher.add('marketplace', 'setName', updateMarketplaceNameHandler)
extrinsicDispatcher.add('marketplace', 'changeMarketType', updateMarketplaceKindHandler)
extrinsicDispatcher.add('marketplace', 'changeOwner', updateMarketplaceOwnerHandler)
// extrinsicDispatcher.add('capsule', 'nftToCapsule', convertToCapsuleHandler)
// extrinsicDispatcher.add('capsule', 'capsuleToNFT', convertToNftHandler)
// extrinsicDispatcher.add('series', 'lock', lockSerieHandler)

export async function handleBlock(block: SubstrateBlock): Promise<void> {
    await blockHandler(block)
}

export async function handleCall(extrinsic: SubstrateExtrinsic): Promise<void> {
    await genericExtrinsicHandler(extrinsic)
    await extrinsicDispatcher.emit(extrinsic)
}

export async function handleEvent(event: SubstrateEvent): Promise<void> {
    //record treasury here ?
    if (event.event.section === 'treasury' && event.event.method === 'Deposit'){
        //treasuryEventHandler2(event)
    }
    await genericEventHandler(event)
}
