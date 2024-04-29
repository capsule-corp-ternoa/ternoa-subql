// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames, FieldsExpression, GetOptions } from "@subql/types-core";
import assert from 'assert';



export type AggregateResultEntityProps = Omit<AggregateResultEntity, NonNullable<FunctionPropertyNames<AggregateResultEntity>>| '_name'>;

export class AggregateResultEntity implements Entity {

    constructor(
        
        id: string,
        occurences: number,
    ) {
        this.id = id;
        this.occurences = occurences;
        
    }

    public id: string;
    public occurences: number;
    

    get _name(): string {
        return 'AggregateResultEntity';
    }

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
        if (record) {
            return this.create(record as AggregateResultEntityProps);
        } else {
            return;
        }
    }


    /**
     * Gets entities matching the specified filters and options.
     *
     * ⚠️ This function will first search cache data followed by DB data. Please consider this when using order and offset options.⚠️
     * */
    static async getByFields(filter: FieldsExpression<AggregateResultEntityProps>[], options?: GetOptions<AggregateResultEntityProps>): Promise<AggregateResultEntity[]> {
        const records = await store.getByFields('AggregateResultEntity', filter, options);
        return records.map(record => this.create(record as AggregateResultEntityProps));
    }

    static create(record: AggregateResultEntityProps): AggregateResultEntity {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new this(
            record.id,
            record.occurences,
        );
        Object.assign(entity,record);
        return entity;
    }
}
