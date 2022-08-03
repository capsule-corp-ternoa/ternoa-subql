// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames} from "@subql/types";
import assert from 'assert';




export class CollectionEntity implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public collectionId: string;

    public owner?: string;

    public offchainData: string;

    public nfts?: string[];

    public limit?: number;

    public hasReachedLimit: boolean;

    public isClosed: boolean;

    public timestampCreate: Date;

    public timestampBurn?: Date;

    public timestampClose?: Date;

    public timestampLimit?: Date;


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
        if (record){
            return CollectionEntity.create(record);
        }else{
            return;
        }
    }


    static async getByOwner(owner: string): Promise<CollectionEntity[] | undefined>{
      
      const records = await store.getByField('CollectionEntity', 'owner', owner);
      return records.map(record => CollectionEntity.create(record));
      
    }

    static async getByTimestampCreate(timestampCreate: Date): Promise<CollectionEntity[] | undefined>{
      
      const records = await store.getByField('CollectionEntity', 'timestampCreate', timestampCreate);
      return records.map(record => CollectionEntity.create(record));
      
    }

    static async getByTimestampBurn(timestampBurn: Date): Promise<CollectionEntity[] | undefined>{
      
      const records = await store.getByField('CollectionEntity', 'timestampBurn', timestampBurn);
      return records.map(record => CollectionEntity.create(record));
      
    }

    static async getByTimestampClose(timestampClose: Date): Promise<CollectionEntity[] | undefined>{
      
      const records = await store.getByField('CollectionEntity', 'timestampClose', timestampClose);
      return records.map(record => CollectionEntity.create(record));
      
    }

    static async getByTimestampLimit(timestampLimit: Date): Promise<CollectionEntity[] | undefined>{
      
      const records = await store.getByField('CollectionEntity', 'timestampLimit', timestampLimit);
      return records.map(record => CollectionEntity.create(record));
      
    }


    static create(record: Partial<Omit<CollectionEntity, FunctionPropertyNames<CollectionEntity>>> & Entity): CollectionEntity {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new CollectionEntity(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
