import {SubstrateExtrinsic,SubstrateEvent} from "@subql/types";
import {starterEntity} from "../types/models/starterEntity";
import {SubstrateBlock} from "@subql/types";
import { ExtrinsicDispatcher } from '../dispatchers'
import {
    transferHandler,
} from '../handlers'

export async function handleBlock(block: SubstrateBlock): Promise<void> {
    //Create a new starterEntity with ID using block hash
    let record = new starterEntity(block.block.header.hash.toString());
    //Record block number
    record.field1 = block.block.header.number.toNumber();
    await record.save();
}


export async function handleEvent(event: SubstrateEvent): Promise<void> {
}

const extrinsicDispatcher = new ExtrinsicDispatcher()

// apply extrinsic handler
extrinsicDispatcher.add('balances', 'transfer', transferHandler)

export async function handleCall(extrinsic: SubstrateExtrinsic): Promise<void> {
    await extrinsicDispatcher.emit(extrinsic)
}

