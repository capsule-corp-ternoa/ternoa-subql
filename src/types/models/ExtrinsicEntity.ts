// Auto-generated , DO NOT EDIT
import {Entity} from "@subql/types";
import assert from 'assert';


export class ExtrinsicEntity implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public blockId: string;

    public extrinsicIndex: number;

    public hash: string;

    public timestamp: Date;

    public module: string;

    public call: string;

    public description?: string;

    public signer: string;

    public isSigned: boolean;

    public signature: string;

    public fees?: string;

    public nonce: number;

    public success: boolean;

    public argsName: string[];

    public argsValue: string[];

    public nbEvents: number;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save ExtrinsicEntity entity without an ID");
        await store.set('ExtrinsicEntity', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove ExtrinsicEntity entity without an ID");
        await store.remove('ExtrinsicEntity', id.toString());
    }

    static async get(id:string): Promise<ExtrinsicEntity | undefined>{
        assert((id !== null && id !== undefined), "Cannot get ExtrinsicEntity entity without an ID");
        const record = await store.get('ExtrinsicEntity', id.toString());
        if (record){
            return ExtrinsicEntity.create(record);
        }else{
            return;
        }
    }


    static async getByHash(hash: string): Promise<ExtrinsicEntity | undefined>{
      
      const record = await store.getOneByField('ExtrinsicEntity', 'hash', hash);
      if (record){
          return ExtrinsicEntity.create(record);
      }else{
          return;
      }
      
    }

    static async getByTimestamp(timestamp: Date): Promise<ExtrinsicEntity[] | undefined>{
      
      const records = await store.getByField('ExtrinsicEntity', 'timestamp', timestamp);
      return records.map(record => ExtrinsicEntity.create(record));
      
    }

    static async getBySigner(signer: string): Promise<ExtrinsicEntity[] | undefined>{
      
      const records = await store.getByField('ExtrinsicEntity', 'signer', signer);
      return records.map(record => ExtrinsicEntity.create(record));
      
    }


    static create(record){
        let entity = new ExtrinsicEntity(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
