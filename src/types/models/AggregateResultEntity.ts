// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames} from "@subql/types";
import assert from 'assert';




type AggregateResultEntityProps = Omit<AggregateResultEntity, NonNullable<FunctionPropertyNames<AggregateResultEntity>>>;

export class AggregateResultEntity implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public occurences: number;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save AggregateResultEntity entity without an ID");
        await store.set('AggregateResultEntity', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove AggregateResultEntity entity without an ID");
        await store.remove('AggregateResultEntity', id.toString());
    }

    static async get(id:string): Promise<AggregateResultEntity | undefined>{
        assert((id !== null && id !== undefined), "Cannot get AggregateResultEntity entity without an ID");
        const record = await store.get('AggregateResultEntity', id.toString());
        if (record){
            return AggregateResultEntity.create(record as AggregateResultEntityProps);
        }else{
            return;
        }
    }



    static create(record: AggregateResultEntityProps): AggregateResultEntity {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new AggregateResultEntity(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
