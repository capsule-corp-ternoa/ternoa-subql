// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames} from "@subql/types";
import assert from 'assert';


export class SessionEntity implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public validators: string[];


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save SessionEntity entity without an ID");
        await store.set('SessionEntity', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove SessionEntity entity without an ID");
        await store.remove('SessionEntity', id.toString());
    }

    static async get(id:string): Promise<SessionEntity | undefined>{
        assert((id !== null && id !== undefined), "Cannot get SessionEntity entity without an ID");
        const record = await store.get('SessionEntity', id.toString());
        if (record){
            return SessionEntity.create(record);
        }else{
            return;
        }
    }



    static create(record: Partial<Omit<SessionEntity, FunctionPropertyNames<SessionEntity>>> & Entity): SessionEntity {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new SessionEntity(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
