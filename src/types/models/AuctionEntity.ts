// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames, FieldsExpression} from "@subql/types-core";
import assert from 'assert';

import {
    Bidder,
} from '../interfaces';



export type AuctionEntityProps = Omit<AuctionEntity, NonNullable<FunctionPropertyNames<AuctionEntity>>| '_name'>;

export class AuctionEntity implements Entity {

    constructor(
        
        id: string,
        nftId: string,
        creator: string,
        isCompleted: boolean,
        isCancelled: boolean,
        isExtendedPeriod: boolean,
        bidders: Bidder[],
        timestampCreated: Date,
    ) {
        this.id = id;
        this.nftId = nftId;
        this.creator = creator;
        this.isCompleted = isCompleted;
        this.isCancelled = isCancelled;
        this.isExtendedPeriod = isExtendedPeriod;
        this.bidders = bidders;
        this.timestampCreated = timestampCreated;
        
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
    public timestampCreated: Date;
    public timestampEnded?: Date;
    public timestampLastBid?: Date;
    public timestampCancelled?: Date;
    

    get _name(): string {
        return 'AuctionEntity';
    }

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
        if (record) {
            return this.create(record as AuctionEntityProps);
        } else {
            return;
        }
    }

    static async getByNftId(nftId: string): Promise<AuctionEntity[] | undefined>{
      const records = await store.getByField('AuctionEntity', 'nftId', nftId);
      return records.map(record => this.create(record as AuctionEntityProps));
    }

    static async getByCreator(creator: string): Promise<AuctionEntity[] | undefined>{
      const records = await store.getByField('AuctionEntity', 'creator', creator);
      return records.map(record => this.create(record as AuctionEntityProps));
    }

    static async getByFields(filter: FieldsExpression<AuctionEntityProps>[], options?: { offset?: number, limit?: number}): Promise<AuctionEntity[]> {
        const records = await store.getByFields('AuctionEntity', filter, options);
        return records.map(record => this.create(record as AuctionEntityProps));
    }

    static create(record: AuctionEntityProps): AuctionEntity {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new this(
            record.id,
            record.nftId,
            record.creator,
            record.isCompleted,
            record.isCancelled,
            record.isExtendedPeriod,
            record.bidders,
            record.timestampCreated,
        );
        Object.assign(entity,record);
        return entity;
    }
}
