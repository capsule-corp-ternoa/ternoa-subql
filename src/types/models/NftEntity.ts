// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames} from "@subql/types";
import assert from 'assert';




export type NftEntityProps = Omit<NftEntity, NonNullable<FunctionPropertyNames<NftEntity>>>;

export class NftEntity implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public nftId: string;

    public auctionId?: string;

    public collectionId?: string;

    public owner?: string;

    public creator: string;

    public offchainData: string;

    public secretOffchainData?: string;

    public capsuleOffchainData?: string;

    public royalty: number;

    public mintFee: string;

    public mintFeeRounded?: number;

    public isCapsule: boolean;

    public isCapsuleSynced: boolean;

    public isSecret: boolean;

    public isSecretSynced: boolean;

    public delegatee?: string;

    public isDelegated: boolean;

    public isSoulbound: boolean;

    public isListed: boolean;

    public typeOfListing?: string;

    public isRented: boolean;

    public rentee?: string;

    public rentalContractId?: string;

    public price?: string;

    public priceRounded?: number;

    public marketplaceId?: string;

    public isTransmission: boolean;

    public transmissionRecipient?: string;

    public tranmissionDataId?: string;

    public createdAt: Date;

    public updatedAt: Date;

    public timestampCreate: Date;

    public timestampBurn?: Date;

    public timestampList?: Date;

    public timestampRented?: Date;

    public timestampSecretAdd?: Date;

    public timestampConvertedToCapsule?: Date;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save NftEntity entity without an ID");
        await store.set('NftEntity', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove NftEntity entity without an ID");
        await store.remove('NftEntity', id.toString());
    }

    static async get(id:string): Promise<NftEntity | undefined>{
        assert((id !== null && id !== undefined), "Cannot get NftEntity entity without an ID");
        const record = await store.get('NftEntity', id.toString());
        if (record){
            return this.create(record as NftEntityProps);
        }else{
            return;
        }
    }


    static async getByAuctionId(auctionId: string): Promise<NftEntity[] | undefined>{
      
      const records = await store.getByField('NftEntity', 'auctionId', auctionId);
      return records.map(record => this.create(record as NftEntityProps));
      
    }

    static async getByCollectionId(collectionId: string): Promise<NftEntity[] | undefined>{
      
      const records = await store.getByField('NftEntity', 'collectionId', collectionId);
      return records.map(record => this.create(record as NftEntityProps));
      
    }

    static async getByOwner(owner: string): Promise<NftEntity[] | undefined>{
      
      const records = await store.getByField('NftEntity', 'owner', owner);
      return records.map(record => this.create(record as NftEntityProps));
      
    }

    static async getByCreator(creator: string): Promise<NftEntity[] | undefined>{
      
      const records = await store.getByField('NftEntity', 'creator', creator);
      return records.map(record => this.create(record as NftEntityProps));
      
    }

    static async getByDelegatee(delegatee: string): Promise<NftEntity[] | undefined>{
      
      const records = await store.getByField('NftEntity', 'delegatee', delegatee);
      return records.map(record => this.create(record as NftEntityProps));
      
    }

    static async getByRentalContractId(rentalContractId: string): Promise<NftEntity[] | undefined>{
      
      const records = await store.getByField('NftEntity', 'rentalContractId', rentalContractId);
      return records.map(record => this.create(record as NftEntityProps));
      
    }

    static async getByMarketplaceId(marketplaceId: string): Promise<NftEntity[] | undefined>{
      
      const records = await store.getByField('NftEntity', 'marketplaceId', marketplaceId);
      return records.map(record => this.create(record as NftEntityProps));
      
    }

    static async getByTranmissionDataId(tranmissionDataId: string): Promise<NftEntity[] | undefined>{
      
      const records = await store.getByField('NftEntity', 'tranmissionDataId', tranmissionDataId);
      return records.map(record => this.create(record as NftEntityProps));
      
    }


    static create(record: NftEntityProps): NftEntity {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new this(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
