// Auto-generated , DO NOT EDIT
import {Entity} from "@subql/types";
import assert from 'assert';


export class ExtrinsicDescriptionEntity implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public module: string;

    public call: string;

    public description: string;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save ExtrinsicDescriptionEntity entity without an ID");
        await store.set('ExtrinsicDescriptionEntity', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove ExtrinsicDescriptionEntity entity without an ID");
        await store.remove('ExtrinsicDescriptionEntity', id.toString());
    }

    static async get(id:string): Promise<ExtrinsicDescriptionEntity | undefined>{
        assert((id !== null && id !== undefined), "Cannot get ExtrinsicDescriptionEntity entity without an ID");
        const record = await store.get('ExtrinsicDescriptionEntity', id.toString());
        if (record){
            return ExtrinsicDescriptionEntity.create(record);
        }else{
            return;
        }
    }



    static create(record){
        let entity = new ExtrinsicDescriptionEntity(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
