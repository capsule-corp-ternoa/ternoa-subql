// Auto-generated , DO NOT EDIT
import {Entity} from "@subql/types";
import assert from 'assert';


export class EventDescriptionEntity implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public module: string;

    public call: string;

    public description: string;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save EventDescriptionEntity entity without an ID");
        await store.set('EventDescriptionEntity', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove EventDescriptionEntity entity without an ID");
        await store.remove('EventDescriptionEntity', id.toString());
    }

    static async get(id:string): Promise<EventDescriptionEntity | undefined>{
        assert((id !== null && id !== undefined), "Cannot get EventDescriptionEntity entity without an ID");
        const record = await store.get('EventDescriptionEntity', id.toString());
        if (record){
            return EventDescriptionEntity.create(record);
        }else{
            return;
        }
    }



    static create(record){
        let entity = new EventDescriptionEntity(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
