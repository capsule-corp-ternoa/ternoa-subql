// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames, FieldsExpression, GetOptions } from "@subql/types-core";
import assert from 'assert';



export type NftOperationEntityProps = Omit<NftOperationEntity, NonNullable<FunctionPropertyNames<NftOperationEntity>>| '_name'>;

export class NftOperationEntity implements Entity {

    constructor(
        
        id: string,
        blockId: string,
        extrinsicId: string,
        nftId: string,
        timestamp: Date,
        typeOfTransaction: string,
    ) {
        this.id = id;
        this.blockId = blockId;
        this.extrinsicId = extrinsicId;
        this.nftId = nftId;
        this.timestamp = timestamp;
        this.typeOfTransaction = typeOfTransaction;
        
    }

    public id: string;
    public blockId: string;
    public extrinsicId: string;
    public nftId: string;
    public from?: string;
    public to?: string;
    public collectionId?: string;
    public commissionFeeType?: string;
    public commissionFee?: string;
    public commissionFeeRounded?: number;
    public listingFeeType?: string;
    public listingFee?: string;
    public listingFeeRounded?: number;
    public price?: string;
    public priceRounded?: number;
    public royalty?: number;
    public royaltyCut?: string;
    public royaltyCutRounded?: number;
    public marketplaceId?: string;
    public marketplaceCut?: string;
    public marketplaceCutRounded?: number;
    public auctionStartPrice?: string;
    public auctionStartPriceRounded?: number;
    public auctionBuyItNowPrice?: string;
    public auctionBuyItNowPriceRounded?: number;
    public rentalContractStartBlock?: number;
    public rentalContractDuration?: string;
    public rentalContractBlockDuration?: number;
    public rentalContractMaxSubscriptionBlockDuration?: number;
    public rentalContractFeeType?: string;
    public rentalContractFee?: string;
    public rentalContractFeeRounded?: number;
    public transmissionProtocol?: string;
    public transmissionEndBlock?: number;
    public timestamp: Date;
    public typeOfTransaction: string;
    

    get _name(): string {
        return 'NftOperationEntity';
    }

    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save NftOperationEntity entity without an ID");
        await store.set('NftOperationEntity', id.toString(), this);
    }

    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove NftOperationEntity entity without an ID");
        await store.remove('NftOperationEntity', id.toString());
    }

    static async get(id:string): Promise<NftOperationEntity | undefined>{
        assert((id !== null && id !== undefined), "Cannot get NftOperationEntity entity without an ID");
        const record = await store.get('NftOperationEntity', id.toString());
        if (record) {
            return this.create(record as NftOperationEntityProps);
        } else {
            return;
        }
    }

    static async getByNftId(nftId: string): Promise<NftOperationEntity[] | undefined>{
      const records = await store.getByField('NftOperationEntity', 'nftId', nftId);
      return records.map(record => this.create(record as NftOperationEntityProps));
    }

    static async getByFrom(from: string): Promise<NftOperationEntity[] | undefined>{
      const records = await store.getByField('NftOperationEntity', 'from', from);
      return records.map(record => this.create(record as NftOperationEntityProps));
    }

    static async getByTo(to: string): Promise<NftOperationEntity[] | undefined>{
      const records = await store.getByField('NftOperationEntity', 'to', to);
      return records.map(record => this.create(record as NftOperationEntityProps));
    }

    static async getByCollectionId(collectionId: string): Promise<NftOperationEntity[] | undefined>{
      const records = await store.getByField('NftOperationEntity', 'collectionId', collectionId);
      return records.map(record => this.create(record as NftOperationEntityProps));
    }

    static async getByMarketplaceId(marketplaceId: string): Promise<NftOperationEntity[] | undefined>{
      const records = await store.getByField('NftOperationEntity', 'marketplaceId', marketplaceId);
      return records.map(record => this.create(record as NftOperationEntityProps));
    }


    /**
     * Gets entities matching the specified filters and options.
     *
     * ⚠️ This function will first search cache data followed by DB data. Please consider this when using order and offset options.⚠️
     * */
    static async getByFields(filter: FieldsExpression<NftOperationEntityProps>[], options?: GetOptions<NftOperationEntityProps>): Promise<NftOperationEntity[]> {
        const records = await store.getByFields('NftOperationEntity', filter, options);
        return records.map(record => this.create(record as NftOperationEntityProps));
    }

    static create(record: NftOperationEntityProps): NftOperationEntity {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new this(
            record.id,
            record.blockId,
            record.extrinsicId,
            record.nftId,
            record.timestamp,
            record.typeOfTransaction,
        );
        Object.assign(entity,record);
        return entity;
    }
}
