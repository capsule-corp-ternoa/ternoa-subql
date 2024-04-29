// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames, FieldsExpression, GetOptions } from "@subql/types-core";
import assert from 'assert';



export type NftEntityProps = Omit<NftEntity, NonNullable<FunctionPropertyNames<NftEntity>>| '_name'>;

export class NftEntity implements Entity {

    constructor(
        
        id: string,
        nftId: string,
        creator: string,
        offchainData: string,
        royalty: number,
        isCapsule: boolean,
        isCapsuleSynced: boolean,
        isSecret: boolean,
        isSecretSynced: boolean,
        isDelegated: boolean,
        isSoulbound: boolean,
        isListed: boolean,
        isRented: boolean,
        isTransmission: boolean,
        createdAt: Date,
        updatedAt: Date,
        timestampCreated: Date,
    ) {
        this.id = id;
        this.nftId = nftId;
        this.creator = creator;
        this.offchainData = offchainData;
        this.royalty = royalty;
        this.isCapsule = isCapsule;
        this.isCapsuleSynced = isCapsuleSynced;
        this.isSecret = isSecret;
        this.isSecretSynced = isSecretSynced;
        this.isDelegated = isDelegated;
        this.isSoulbound = isSoulbound;
        this.isListed = isListed;
        this.isRented = isRented;
        this.isTransmission = isTransmission;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.timestampCreated = timestampCreated;
        
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
    public transmissionProtocolId?: string;
    public createdAt: Date;
    public updatedAt: Date;
    public timestampCreated: Date;
    public timestampBurned?: Date;
    public timestampListed?: Date;
    public timestampRented?: Date;
    public timestampSecretAdded?: Date;
    public timestampConvertedToCapsule?: Date;
    

    get _name(): string {
        return 'NftEntity';
    }

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
        if (record) {
            return this.create(record as NftEntityProps);
        } else {
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

    static async getByTransmissionProtocolId(transmissionProtocolId: string): Promise<NftEntity[] | undefined>{
      const records = await store.getByField('NftEntity', 'transmissionProtocolId', transmissionProtocolId);
      return records.map(record => this.create(record as NftEntityProps));
    }


    /**
     * Gets entities matching the specified filters and options.
     *
     * ⚠️ This function will first search cache data followed by DB data. Please consider this when using order and offset options.⚠️
     * */
    static async getByFields(filter: FieldsExpression<NftEntityProps>[], options?: GetOptions<NftEntityProps>): Promise<NftEntity[]> {
        const records = await store.getByFields('NftEntity', filter, options);
        return records.map(record => this.create(record as NftEntityProps));
    }

    static create(record: NftEntityProps): NftEntity {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new this(
            record.id,
            record.nftId,
            record.creator,
            record.offchainData,
            record.royalty,
            record.isCapsule,
            record.isCapsuleSynced,
            record.isSecret,
            record.isSecretSynced,
            record.isDelegated,
            record.isSoulbound,
            record.isListed,
            record.isRented,
            record.isTransmission,
            record.createdAt,
            record.updatedAt,
            record.timestampCreated,
        );
        Object.assign(entity,record);
        return entity;
    }
}
