// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames} from "@subql/types";
import assert from 'assert';




export class SerieEntity implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public owner: string;

    public locked: boolean;

    public createdAt: Date;

    public updatedAt: Date;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save SerieEntity entity without an ID");
        await store.set('SerieEntity', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove SerieEntity entity without an ID");
        await store.remove('SerieEntity', id.toString());
    }

    static async get(id:string): Promise<SerieEntity | undefined>{
        assert((id !== null && id !== undefined), "Cannot get SerieEntity entity without an ID");
        const record = await store.get('SerieEntity', id.toString());
        if (record){
            return SerieEntity.create(record);
        }else{
            return;
        }
    }


    static async getByOwner(owner: string): Promise<SerieEntity[] | undefined>{
      
      const records = await store.getByField('SerieEntity', 'owner', owner);
      return records.map(record => SerieEntity.create(record));
      
    }


    static create(record: Partial<Omit<SerieEntity, FunctionPropertyNames<SerieEntity>>> & Entity): SerieEntity {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new SerieEntity(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
