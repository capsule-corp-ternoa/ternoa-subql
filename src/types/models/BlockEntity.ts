// Auto-generated , DO NOT EDIT
import {Entity} from "@subql/types";
import assert from 'assert';


export class BlockEntity implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public number: number;

    public hash: string;

    public timestamp: Date;

    public parentHash: string;

    public stateRoot: string;

    public extrinsicsRoot: string;

    public runtimeVersion: number;

    public nbExtrinsics: number;

    public author?: string;

    public sessionId?: number;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save BlockEntity entity without an ID");
        await store.set('BlockEntity', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove BlockEntity entity without an ID");
        await store.remove('BlockEntity', id.toString());
    }

    static async get(id:string): Promise<BlockEntity | undefined>{
        assert((id !== null && id !== undefined), "Cannot get BlockEntity entity without an ID");
        const record = await store.get('BlockEntity', id.toString());
        if (record){
            return BlockEntity.create(record);
        }else{
            return;
        }
    }


    static async getByHash(hash: string): Promise<BlockEntity | undefined>{
      
      const record = await store.getOneByField('BlockEntity', 'hash', hash);
      if (record){
          return BlockEntity.create(record);
      }else{
          return;
      }
      
    }

    static async getByTimestamp(timestamp: Date): Promise<BlockEntity | undefined>{
      
      const record = await store.getOneByField('BlockEntity', 'timestamp', timestamp);
      if (record){
          return BlockEntity.create(record);
      }else{
          return;
      }
      
    }

    static async getByAuthor(author: string): Promise<BlockEntity[] | undefined>{
      
      const records = await store.getByField('BlockEntity', 'author', author);
      return records.map(record => BlockEntity.create(record));
      
    }

    static async getBySessionId(sessionId: number): Promise<BlockEntity[] | undefined>{
      
      const records = await store.getByField('BlockEntity', 'sessionId', sessionId);
      return records.map(record => BlockEntity.create(record));
      
    }


    static create(record){
        let entity = new BlockEntity(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
