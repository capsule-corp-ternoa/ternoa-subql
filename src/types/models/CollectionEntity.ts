// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames, FieldsExpression} from "@subql/types-core";
import assert from 'assert';



export type CollectionEntityProps = Omit<CollectionEntity, NonNullable<FunctionPropertyNames<CollectionEntity>>| '_name'>;

export class CollectionEntity implements Entity {

    constructor(
        
        id: string,
        collectionId: string,
        offchainData: string,
        nfts: string[],
        nbNfts: number,
        hasReachedLimit: boolean,
        isClosed: boolean,
        timestampCreated: Date,
    ) {
        this.id = id;
        this.collectionId = collectionId;
        this.offchainData = offchainData;
        this.nfts = nfts;
        this.nbNfts = nbNfts;
        this.hasReachedLimit = hasReachedLimit;
        this.isClosed = isClosed;
        this.timestampCreated = timestampCreated;
        
    }

    public id: string;
    public collectionId: string;
    public owner?: string;
    public offchainData: string;
    public nfts: string[];
    public nbNfts: number;
    public limit?: number;
    public hasReachedLimit: boolean;
    public isClosed: boolean;
    public timestampCreated: Date;
    public timestampBurned?: Date;
    public timestampClosed?: Date;
    public timestampLimited?: Date;
    

    get _name(): string {
        return 'CollectionEntity';
    }

    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save CollectionEntity entity without an ID");
        await store.set('CollectionEntity', id.toString(), this);
    }

    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove CollectionEntity entity without an ID");
        await store.remove('CollectionEntity', id.toString());
    }

    static async get(id:string): Promise<CollectionEntity | undefined>{
        assert((id !== null && id !== undefined), "Cannot get CollectionEntity entity without an ID");
        const record = await store.get('CollectionEntity', id.toString());
        if (record) {
            return this.create(record as CollectionEntityProps);
        } else {
            return;
        }
    }

    static async getByOwner(owner: string): Promise<CollectionEntity[] | undefined>{
      const records = await store.getByField('CollectionEntity', 'owner', owner);
      return records.map(record => this.create(record as CollectionEntityProps));
    }

    static async getByFields(filter: FieldsExpression<CollectionEntityProps>[], options?: { offset?: number, limit?: number}): Promise<CollectionEntity[]> {
        const records = await store.getByFields('CollectionEntity', filter, options);
        return records.map(record => this.create(record as CollectionEntityProps));
    }

    static create(record: CollectionEntityProps): CollectionEntity {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new this(
            record.id,
            record.collectionId,
            record.offchainData,
            record.nfts,
            record.nbNfts,
            record.hasReachedLimit,
            record.isClosed,
            record.timestampCreated,
        );
        Object.assign(entity,record);
        return entity;
    }
}
