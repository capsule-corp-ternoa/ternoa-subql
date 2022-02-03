// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames} from "@subql/types";
import assert from 'assert';




export class NftTransferEntity implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public blockId: string;

    public extrinsicId: string;

    public nftId: string;

    public seriesId: string;

    public from: string;

    public to: string;

    public timestamp: Date;

    public typeOfTransaction: string;

    public amount: string;

    public amountRounded: number;

    public marketplaceId?: string;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save NftTransferEntity entity without an ID");
        await store.set('NftTransferEntity', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove NftTransferEntity entity without an ID");
        await store.remove('NftTransferEntity', id.toString());
    }

    static async get(id:string): Promise<NftTransferEntity | undefined>{
        assert((id !== null && id !== undefined), "Cannot get NftTransferEntity entity without an ID");
        const record = await store.get('NftTransferEntity', id.toString());
        if (record){
            return NftTransferEntity.create(record);
        }else{
            return;
        }
    }


    static async getByNftId(nftId: string): Promise<NftTransferEntity[] | undefined>{
      
      const records = await store.getByField('NftTransferEntity', 'nftId', nftId);
      return records.map(record => NftTransferEntity.create(record));
      
    }

    static async getByFrom(from: string): Promise<NftTransferEntity[] | undefined>{
      
      const records = await store.getByField('NftTransferEntity', 'from', from);
      return records.map(record => NftTransferEntity.create(record));
      
    }

    static async getByTo(to: string): Promise<NftTransferEntity[] | undefined>{
      
      const records = await store.getByField('NftTransferEntity', 'to', to);
      return records.map(record => NftTransferEntity.create(record));
      
    }

    static async getByTimestamp(timestamp: Date): Promise<NftTransferEntity[] | undefined>{
      
      const records = await store.getByField('NftTransferEntity', 'timestamp', timestamp);
      return records.map(record => NftTransferEntity.create(record));
      
    }


    static create(record: Partial<Omit<NftTransferEntity, FunctionPropertyNames<NftTransferEntity>>> & Entity): NftTransferEntity {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new NftTransferEntity(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
