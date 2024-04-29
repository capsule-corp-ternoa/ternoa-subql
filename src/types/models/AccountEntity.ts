// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames, FieldsExpression, GetOptions } from "@subql/types-core";
import assert from 'assert';



export type AccountEntityProps = Omit<AccountEntity, NonNullable<FunctionPropertyNames<AccountEntity>>| '_name'>;

export class AccountEntity implements Entity {

    constructor(
        
        id: string,
        createdAt: Date,
        updatedAt: Date,
    ) {
        this.id = id;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        
    }

    public id: string;
    public capsAmount?: string;
    public capsAmountFrozen?: string;
    public capsAmountTotal?: string;
    public capsAmountRounded?: number;
    public capsAmountFrozenRounded?: number;
    public capsAmountTotalRounded?: number;
    public createdAt: Date;
    public updatedAt: Date;
    

    get _name(): string {
        return 'AccountEntity';
    }

    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save AccountEntity entity without an ID");
        await store.set('AccountEntity', id.toString(), this);
    }

    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove AccountEntity entity without an ID");
        await store.remove('AccountEntity', id.toString());
    }

    static async get(id:string): Promise<AccountEntity | undefined>{
        assert((id !== null && id !== undefined), "Cannot get AccountEntity entity without an ID");
        const record = await store.get('AccountEntity', id.toString());
        if (record) {
            return this.create(record as AccountEntityProps);
        } else {
            return;
        }
    }


    /**
     * Gets entities matching the specified filters and options.
     *
     * ⚠️ This function will first search cache data followed by DB data. Please consider this when using order and offset options.⚠️
     * */
    static async getByFields(filter: FieldsExpression<AccountEntityProps>[], options?: GetOptions<AccountEntityProps>): Promise<AccountEntity[]> {
        const records = await store.getByFields('AccountEntity', filter, options);
        return records.map(record => this.create(record as AccountEntityProps));
    }

    static create(record: AccountEntityProps): AccountEntity {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new this(
            record.id,
            record.createdAt,
            record.updatedAt,
        );
        Object.assign(entity,record);
        return entity;
    }
}
