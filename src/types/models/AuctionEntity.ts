// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames} from "@subql/types";
import assert from 'assert';

import {
    Bidder,
} from '../interfaces'




type AuctionEntityProps = Omit<AuctionEntity, NonNullable<FunctionPropertyNames<AuctionEntity>>>;

export class AuctionEntity implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public nftId: string;

    public marketplaceId?: string;

    public creator: string;

    public startPrice?: string;

    public startPriceRounded?: number;

    public buyItNowPrice?: string;

    public buyItNowPriceRounded?: number;

    public startBlockId?: number;

    public endBlockId?: number;

    public isCompleted: boolean;

    public isCancelled: boolean;

    public isExtendedPeriod: boolean;

    public bidders: Bidder[];

    public nbBidders?: number;

    public topBidAmount?: string;

    public topBidAmountRounded?: number;

    public typeOfSale?: string;

    public timestampCreate: Date;

    public timestampEnd?: Date;

    public timestampLastBid?: Date;

    public timestampCancelled?: Date;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save AuctionEntity entity without an ID");
        await store.set('AuctionEntity', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove AuctionEntity entity without an ID");
        await store.remove('AuctionEntity', id.toString());
    }

    static async get(id:string): Promise<AuctionEntity | undefined>{
        assert((id !== null && id !== undefined), "Cannot get AuctionEntity entity without an ID");
        const record = await store.get('AuctionEntity', id.toString());
        if (record){
            return AuctionEntity.create(record as AuctionEntityProps);
        }else{
            return;
        }
    }


    static async getByNftId(nftId: string): Promise<AuctionEntity[] | undefined>{
      
      const records = await store.getByField('AuctionEntity', 'nftId', nftId);
      return records.map(record => AuctionEntity.create(record as AuctionEntityProps));
      
    }

    static async getByCreator(creator: string): Promise<AuctionEntity[] | undefined>{
      
      const records = await store.getByField('AuctionEntity', 'creator', creator);
      return records.map(record => AuctionEntity.create(record as AuctionEntityProps));
      
    }

    static async getByTimestampCreate(timestampCreate: Date): Promise<AuctionEntity[] | undefined>{
      
      const records = await store.getByField('AuctionEntity', 'timestampCreate', timestampCreate);
      return records.map(record => AuctionEntity.create(record as AuctionEntityProps));
      
    }

    static async getByTimestampLastBid(timestampLastBid: Date): Promise<AuctionEntity[] | undefined>{
      
      const records = await store.getByField('AuctionEntity', 'timestampLastBid', timestampLastBid);
      return records.map(record => AuctionEntity.create(record as AuctionEntityProps));
      
    }


    static create(record: AuctionEntityProps): AuctionEntity {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new AuctionEntity(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
