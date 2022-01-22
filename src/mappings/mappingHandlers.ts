import {SubstrateExtrinsic} from "@subql/types";
import { ExtrinsicDispatcher } from '../dispatchers'
import {
    transferHandler,
    listHandler,
    unlistHandler,
    createHandler,
    burnHandler,
    buyHandler,
    NFTtransferHandler,
    createMarketplaceHandler,
    setMarketplaceOwnerHandler,
    setMarketplaceNameHandler,
    setMarketplaceTypeHandler,
    setMarketplaceCommissionFeeHandler,
    setMarketplaceUriHandler,
    setMarketplaceLogoUriHandler,
    addAccountToAllowListHandler,
    addAccountToDisallowListHandler,
    removeAccountFromAllowListHandler,
    removeAccountFromDisallowListHandler,
    lockSerieHandler,
    setNFTIpfsHandler,
    createFromNftHandler,
    createCapsuleHandler,
    removeCapsuleHandler,
    addFundsHandler,
    setCapsuleIpfsHandler,
    addAssociatedAccountHandler,
} from '../handlers'

// init and populate extrinsicDispatcher for specific extrinsic to record
const extrinsicDispatcher = new ExtrinsicDispatcher()
extrinsicDispatcher.add('balances', 'transfer', transferHandler)
extrinsicDispatcher.add('balances', 'transferKeepAlive', transferHandler)
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
extrinsicDispatcher.add('marketplace', 'addAccountToAllowList', addAccountToAllowListHandler)
extrinsicDispatcher.add('marketplace', 'addAccountToDisallowList', addAccountToDisallowListHandler)
extrinsicDispatcher.add('marketplace', 'removeAccountFromAllowList', removeAccountFromAllowListHandler)
extrinsicDispatcher.add('marketplace', 'removeAccountFromDisallowList', removeAccountFromDisallowListHandler)
extrinsicDispatcher.add('marketplace', 'create', createMarketplaceHandler)
extrinsicDispatcher.add('marketplace', 'list', listHandler)
extrinsicDispatcher.add('marketplace', 'unlist', unlistHandler)
extrinsicDispatcher.add('marketplace', 'setCommissionFee', setMarketplaceCommissionFeeHandler)
extrinsicDispatcher.add('marketplace', 'setLogoUri', setMarketplaceLogoUriHandler)
extrinsicDispatcher.add('marketplace', 'setMarketType', setMarketplaceTypeHandler)
extrinsicDispatcher.add('marketplace', 'setName', setMarketplaceNameHandler)
extrinsicDispatcher.add('marketplace', 'setOwner', setMarketplaceOwnerHandler)
extrinsicDispatcher.add('marketplace', 'setUri', setMarketplaceUriHandler)
extrinsicDispatcher.add('associatedAccounts', 'setAltvrUsername', addAssociatedAccountHandler)

export async function handleCall(extrinsic: SubstrateExtrinsic): Promise<void> {
    logger.info(`${extrinsic.extrinsic.method.section}_${extrinsic.extrinsic.method.method}`)
    await extrinsicDispatcher.emit(extrinsic)
}