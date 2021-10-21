// Auto-generated , DO NOT EDIT
import {Entity} from "@subql/types";
import assert from 'assert';


export class EventEntity implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public blockId: string;

    public extrinsicId: string;

    public eventIndex: number;

    public module: string;

    public call: string;

    public description: string;

    public argsName: string[];

    public argsValue: string[];


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save EventEntity entity without an ID");
        await store.set('EventEntity', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove EventEntity entity without an ID");
        await store.remove('EventEntity', id.toString());
    }

    static async get(id:string): Promise<EventEntity | undefined>{
        assert((id !== null && id !== undefined), "Cannot get EventEntity entity without an ID");
        const record = await store.get('EventEntity', id.toString());
        if (record){
            return EventEntity.create(record);
        }else{
            return;
        }
    }



    static create(record){
        let entity = new EventEntity(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
