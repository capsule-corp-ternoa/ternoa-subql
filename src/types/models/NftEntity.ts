// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames} from "@subql/types";
import assert from 'assert';




export class NftEntity implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public serieId: string;

    public nftId: string;

    public nftIpfs: string;

    public capsuleIpfs?: string;

    public isCapsule: boolean;

    public frozenCaps: string;

    public timestampList?: Date;

    public currency: string;

    public price?: string;

    public priceTiime?: string;

    public listed: number;

    public isLocked: boolean;

    public timestampBurn?: Date;

    public owner: string;

    public creator: string;

    public marketplaceId?: string;

    public createdAt: Date;

    public updatedAt: Date;


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
            return NftEntity.create(record);
        }else{
            return;
        }
    }


    static async getBySerieId(serieId: string): Promise<NftEntity[] | undefined>{
      
      const records = await store.getByField('NftEntity', 'serieId', serieId);
      return records.map(record => NftEntity.create(record));
      
    }

    static async getByTimestampList(timestampList: Date): Promise<NftEntity[] | undefined>{
      
      const records = await store.getByField('NftEntity', 'timestampList', timestampList);
      return records.map(record => NftEntity.create(record));
      
    }

    static async getByTimestampBurn(timestampBurn: Date): Promise<NftEntity[] | undefined>{
      
      const records = await store.getByField('NftEntity', 'timestampBurn', timestampBurn);
      return records.map(record => NftEntity.create(record));
      
    }

    static async getByOwner(owner: string): Promise<NftEntity[] | undefined>{
      
      const records = await store.getByField('NftEntity', 'owner', owner);
      return records.map(record => NftEntity.create(record));
      
    }

    static async getByCreator(creator: string): Promise<NftEntity[] | undefined>{
      
      const records = await store.getByField('NftEntity', 'creator', creator);
      return records.map(record => NftEntity.create(record));
      
    }


    static create(record: Partial<Omit<NftEntity, FunctionPropertyNames<NftEntity>>> & Entity): NftEntity {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new NftEntity(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
