import { SubstrateEvent } from "@subql/types";
import * as eventHandlers from '../eventHandlers'
import { getSigner, updateAccount } from "../helpers";

export async function handleEvent(event: SubstrateEvent): Promise<void> {
    const key = `${event.event.section}.${event.event.method}`
    logger.info(key)
    try{
        switch(key){
            case 'associatedAccounts.AltVRUsernameChanged':
                await eventHandlers.altVRUsernameChangedHandler(event)
                break;
            case 'balances.Transfer':
                await eventHandlers.transferHandler(event)
                break;
            case 'capsules.CapsuleFundsAdded':
                await eventHandlers.capsulesFundsAddedHandler(event)
                break;
            case 'capsules.CapsuleIpfsReferenceChanged':
                await eventHandlers.capsulesIpfsReferenceChangedHandler(event)
                break;
            case 'capsules.CapsuleRemoved':
                await eventHandlers.capsulesRemovedHandler(event)
                break;
            case 'capsules.CapsuleCreated':
                await eventHandlers.capsulesCreatedHandler(event)
                break;
            case 'marketplace.AccountAddedToAllowList':
                await eventHandlers.accountAddedToAllowListHandler(event)
                break;
            case 'marketplace.AccountAddedToDisallowList':
                await eventHandlers.accountAddedToDisallowListHandler(event)
                break;
            case 'marketplace.AccountRemovedFromAllowList':
                await eventHandlers.accountRemovedFromAllowListHandler(event)
                break;
            case 'marketplace.AccountRemovedFromDisallowList':
                await eventHandlers.accountRemovedFromDisallowListHandler(event)
                break;
            case 'marketplace.MarketplaceCreated':
                await eventHandlers.marketplaceCreatedHandler(event)
                break;
            case 'marketplace.MarketplaceCommissionFeeChanged':
                await eventHandlers.marketplaceCommissionFeeChangedHandler(event)
                break;
            case 'marketplace.MarketplaceDescriptionUpdated'://TODO Weird name
                await eventHandlers.marketplaceDescriptionChangedHandler(event)
                break;
            case 'marketplace.MarketplaceLogoUriUpdated'://TODO Weird name
                await eventHandlers.marketplaceLogoUriChangedHandler(event)
                break;
            case 'marketplace.MarketplaceTypeChanged':
                await eventHandlers.marketplaceTypeChangedHandler(event)
                break;
            case 'marketplace.MarketplaceNameChanged':
                await eventHandlers.marketplaceNameChangedHandler(event)
                break;
            case 'marketplace.MarketplaceChangedOwner'://TODO Weird name
                await eventHandlers.marketplaceOwnerChangedHandler(event)
                break;
            case 'marketplace.MarketplaceUriUpdated'://TODO Weird name
                await eventHandlers.marketplaceUriChangedHandler(event)
                break;
            case 'marketplace.NftListed':
                await eventHandlers.marketplaceNftListedHandler(event)
                break;
            case 'marketplace.NftSold':
                await eventHandlers.marketplaceNftSoldHandler(event)
                break;
            case 'nfts.Burned'://OK
                await eventHandlers.nftsBurnedHandler(event)
                break;
            case 'nfts.Created'://OK
                await eventHandlers.nftsCreatedHandler(event)
                break;
            case 'nfts.SeriesFinished'://OK
                await eventHandlers.nftsSeriesFinishedHandler(event)
                break;
            case 'nfts.Transfer'://OK
                await eventHandlers.nftsTransferHandler(event)
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