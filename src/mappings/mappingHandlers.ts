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
    createMarketplaceHandler,
    setMarketplaceOwnerHandler,
    setMarketplaceNameHandler,
    setMarketplaceTypeHandler,
    setMarketplaceCommissionFeeHandler,
    setMarketplaceUriHandler,
    setMarketplaceLogoUriHandler,
    lockSerieHandler,
    setNFTIpfsHandler,
    createFromNftHandler,
    createCapsuleHandler,
    removeCapsuleHandler,
    addFundsHandler,
    setCapsuleIpfsHandler,
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
extrinsicDispatcher.add('nfts', 'finishSeries', lockSerieHandler)
extrinsicDispatcher.add('nfts', 'setIpfsReference', setNFTIpfsHandler)
extrinsicDispatcher.add('capsules', 'create', createCapsuleHandler)
extrinsicDispatcher.add('capsules', 'createFromNft', createFromNftHandler)
extrinsicDispatcher.add('capsules', 'remove', removeCapsuleHandler)
extrinsicDispatcher.add('capsules', 'addFunds', addFundsHandler)
extrinsicDispatcher.add('capsules', 'setIpfsReference', setCapsuleIpfsHandler)
extrinsicDispatcher.add('marketplace', 'buy', buyHandler)
extrinsicDispatcher.add('marketplace', 'create', createMarketplaceHandler)
extrinsicDispatcher.add('marketplace', 'list', listHandler)
extrinsicDispatcher.add('marketplace', 'unlist', unlistHandler)
extrinsicDispatcher.add('marketplace', 'setCommissionFee', setMarketplaceCommissionFeeHandler)
extrinsicDispatcher.add('marketplace', 'setLogoUri', setMarketplaceLogoUriHandler)
extrinsicDispatcher.add('marketplace', 'setMarketType', setMarketplaceTypeHandler)
extrinsicDispatcher.add('marketplace', 'setName', setMarketplaceNameHandler)
extrinsicDispatcher.add('marketplace', 'setOwner', setMarketplaceOwnerHandler)
extrinsicDispatcher.add('marketplace', 'setUri', setMarketplaceUriHandler)

export async function handleBlock(block: SubstrateBlock): Promise<void> {
    await blockHandler(block)
}

export async function handleCall(extrinsic: SubstrateExtrinsic): Promise<void> {
    await genericExtrinsicHandler(extrinsic)
    await extrinsicDispatcher.emit(extrinsic)
}

export async function handleEvent(event: SubstrateEvent): Promise<void> {
    await genericEventHandler(event)
}
