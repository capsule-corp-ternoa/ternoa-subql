// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames} from "@subql/types";
import assert from 'assert';




type AccountEntityProps = Omit<AccountEntity, NonNullable<FunctionPropertyNames<AccountEntity>>>;

export class AccountEntity implements Entity {

    constructor(id: string) {
        this.id = id;
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
        if (record){
            return AccountEntity.create(record as AccountEntityProps);
        }else{
            return;
        }
    }



    static create(record: AccountEntityProps): AccountEntity {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new AccountEntity(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
