// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames} from "@subql/types";
import assert from 'assert';




export type NftOperationEntityProps = Omit<NftOperationEntity, NonNullable<FunctionPropertyNames<NftOperationEntity>>>;

export class NftOperationEntity implements Entity {

    constructor(id: string) {
        this.id = id;
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

    public timestamp: Date;

    public typeOfTransaction: string;


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
        if (record){
            return this.create(record as NftOperationEntityProps);
        }else{
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


    static create(record: NftOperationEntityProps): NftOperationEntity {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new this(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
