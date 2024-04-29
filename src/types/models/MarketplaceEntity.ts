// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames, FieldsExpression, GetOptions } from "@subql/types-core";
import assert from 'assert';



export type MarketplaceEntityProps = Omit<MarketplaceEntity, NonNullable<FunctionPropertyNames<MarketplaceEntity>>| '_name'>;

export class MarketplaceEntity implements Entity {

    constructor(
        
        id: string,
        marketplaceId: string,
        owner: string,
        kind: string,
        createdAt: Date,
        updatedAt: Date,
        timestampCreated: Date,
    ) {
        this.id = id;
        this.marketplaceId = marketplaceId;
        this.owner = owner;
        this.kind = kind;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.timestampCreated = timestampCreated;
        
    }

    public id: string;
    public marketplaceId: string;
    public owner: string;
    public kind: string;
    public commissionFeeType?: string;
    public commissionFee?: string;
    public commissionFeeRounded?: number;
    public listingFeeType?: string;
    public listingFee?: string;
    public listingFeeRounded?: number;
    public accountList?: string[];
    public offchainData?: string;
    public collectionList?: string[];
    public createdAt: Date;
    public updatedAt: Date;
    public timestampCreated: Date;
    

    get _name(): string {
        return 'MarketplaceEntity';
    }

    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save MarketplaceEntity entity without an ID");
        await store.set('MarketplaceEntity', id.toString(), this);
    }

    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove MarketplaceEntity entity without an ID");
        await store.remove('MarketplaceEntity', id.toString());
    }

    static async get(id:string): Promise<MarketplaceEntity | undefined>{
        assert((id !== null && id !== undefined), "Cannot get MarketplaceEntity entity without an ID");
        const record = await store.get('MarketplaceEntity', id.toString());
        if (record) {
            return this.create(record as MarketplaceEntityProps);
        } else {
            return;
        }
    }

    static async getByMarketplaceId(marketplaceId: string): Promise<MarketplaceEntity[] | undefined>{
      const records = await store.getByField('MarketplaceEntity', 'marketplaceId', marketplaceId);
      return records.map(record => this.create(record as MarketplaceEntityProps));
    }

    static async getByOwner(owner: string): Promise<MarketplaceEntity[] | undefined>{
      const records = await store.getByField('MarketplaceEntity', 'owner', owner);
      return records.map(record => this.create(record as MarketplaceEntityProps));
    }


    /**
     * Gets entities matching the specified filters and options.
     *
     * ⚠️ This function will first search cache data followed by DB data. Please consider this when using order and offset options.⚠️
     * */
    static async getByFields(filter: FieldsExpression<MarketplaceEntityProps>[], options?: GetOptions<MarketplaceEntityProps>): Promise<MarketplaceEntity[]> {
        const records = await store.getByFields('MarketplaceEntity', filter, options);
        return records.map(record => this.create(record as MarketplaceEntityProps));
    }

    static create(record: MarketplaceEntityProps): MarketplaceEntity {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new this(
            record.id,
            record.marketplaceId,
            record.owner,
            record.kind,
            record.createdAt,
            record.updatedAt,
            record.timestampCreated,
        );
        Object.assign(entity,record);
        return entity;
    }
}
