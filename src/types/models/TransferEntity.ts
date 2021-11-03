// Auto-generated , DO NOT EDIT
import {Entity} from "@subql/types";
import assert from 'assert';


export class TransferEntity implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public blockId: string;

    public blockHash: string;

    public extrinsicId: string;

    public isBatch: number;

    public isSudo: number;

    public isSuccess: number;

    public timestamp: Date;

    public from: string;

    public to: string;

    public currency: string;

    public amount: string;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save TransferEntity entity without an ID");
        await store.set('TransferEntity', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove TransferEntity entity without an ID");
        await store.remove('TransferEntity', id.toString());
    }

    static async get(id:string): Promise<TransferEntity | undefined>{
        assert((id !== null && id !== undefined), "Cannot get TransferEntity entity without an ID");
        const record = await store.get('TransferEntity', id.toString());
        if (record){
            return TransferEntity.create(record);
        }else{
            return;
        }
    }


    static async getByTimestamp(timestamp: Date): Promise<TransferEntity[] | undefined>{
      
      const records = await store.getByField('TransferEntity', 'timestamp', timestamp);
      return records.map(record => TransferEntity.create(record));
      
    }


    static create(record){
        let entity = new TransferEntity(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
