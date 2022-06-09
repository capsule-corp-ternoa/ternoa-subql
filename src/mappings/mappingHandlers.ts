import { SubstrateEvent } from "@subql/types";
import * as eventHandlers from '../eventHandlers'
import { getSigner, updateAccount } from "../helpers";

export async function handleEvent(event: SubstrateEvent): Promise<void> {
    const key = `${event.event.section}.${event.event.method}`
    logger.info(key)
    try{
        switch(key){
            case 'associatedAccounts.UserAccountAdded': // not tested, need to add any account key first from root account
                await eventHandlers.usernameChangedHandler(event)
                break;
            // case 'balances.Transfer': // ok
            //     await eventHandlers.transferHandler(event)
            //     break;
            // case 'capsules.CapsuleFundsAdded': // not tested, pallet not available
            //     await eventHandlers.capsulesFundsAddedHandler(event)
            //     break;
            // case 'capsules.CapsuleIpfsReferenceChanged': // not tested, pallet not available
            //     await eventHandlers.capsulesIpfsReferenceChangedHandler(event)
            //     break;
            // case 'capsules.CapsuleRemoved': // not tested, pallet not available
            //     await eventHandlers.capsulesRemovedHandler(event)
            //     break;
            // case 'capsules.CapsuleCreated': // not tested, pallet not available
            //     await eventHandlers.capsulesCreatedHandler(event)
            //     break;
            // case 'marketplace.AccountAddedToAllowList': // not tested, pallet not available
            //     await eventHandlers.accountAddedToAllowListHandler(event)
            //     break;
            // case 'marketplace.AccountAddedToDisallowList': // not tested, pallet not available
            //     await eventHandlers.accountAddedToDisallowListHandler(event)
            //     break;
            // case 'marketplace.AccountRemovedFromAllowList': // not tested, pallet not available
            //     await eventHandlers.accountRemovedFromAllowListHandler(event)
            //     break;
            // case 'marketplace.AccountRemovedFromDisallowList': // not tested, pallet not available
            //     await eventHandlers.accountRemovedFromDisallowListHandler(event)
            //     break;
            // case 'marketplace.MarketplaceCreated': // not tested, pallet not available
            //     await eventHandlers.marketplaceCreatedHandler(event)
            //     break;
            // case 'marketplace.MarketplaceCommissionFeeChanged': // not tested, pallet not available
            //     await eventHandlers.marketplaceCommissionFeeChangedHandler(event)
            //     break;
            // case 'marketplace.MarketplaceDescriptionUpdated': // not tested, pallet not available//TODO Weird name
            //     await eventHandlers.marketplaceDescriptionChangedHandler(event)
            //     break;
            // case 'marketplace.MarketplaceLogoUriUpdated': // not tested, pallet not available//TODO Weird name
            //     await eventHandlers.marketplaceLogoUriChangedHandler(event)
            //     break;
            // case 'marketplace.MarketplaceTypeChanged': // not tested, pallet not available
            //     await eventHandlers.marketplaceTypeChangedHandler(event)
            //     break;
            // case 'marketplace.MarketplaceNameChanged': // not tested, pallet not available
            //     await eventHandlers.marketplaceNameChangedHandler(event)
            //     break;
            // case 'marketplace.MarketplaceChangedOwner': // not tested, pallet not available//TODO Weird name
            //     await eventHandlers.marketplaceOwnerChangedHandler(event)
            //     break;
            // case 'marketplace.MarketplaceUriUpdated': // not tested, pallet not available//TODO Weird name
            //     await eventHandlers.marketplaceUriChangedHandler(event)
            //     break;
            // case 'marketplace.NftListed': // not tested, pallet not available
            //     await eventHandlers.marketplaceNftListedHandler(event)
            //     break;
            // case 'marketplace.NftUnlisted': // not tested, pallet not available
            //     await eventHandlers.marketplaceNftUnlistedHandler(event)
            //     break;
            // case 'marketplace.NftSold': // not tested, pallet not available, when test, check that it trigger a balance transfer, else add update account for old owner
            //     await eventHandlers.marketplaceNftSoldHandler(event)
            //     break;
            case 'nft.NFTCreated': // ok
                await eventHandlers.nftsCreatedHandler(event)
                break;
            case 'nfts.NFTBurned': // ok
                await eventHandlers.nftsBurnedHandler(event)
                break;
            // case 'nfts.SeriesFinished': // ok
            //     await eventHandlers.nftsSeriesFinishedHandler(event)
            //     break;
            case 'nfts.NFTTransferred': // ok
                await eventHandlers.nftsTransferHandler(event)
                break;
            case 'nfts.NFTLent': // ok
                await eventHandlers.nftsLentHandler(event)
                break;
            default:
                break;
        }
        try{
            const signer = getSigner(event)
            await updateAccount(signer)
        }catch{
            // No account to update
        }
    }catch(err){
        logger.error("Error in event " + key + " at block " + event.block.block.header.number.toString())
        logger.error("Error detail " + err)
        if (err.sql) logger.error("Error detail sql " + err.sql)
    }
}