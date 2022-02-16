// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames} from "@subql/types";
import assert from 'assert';




type AssociatedAccountEntityProps = Omit<AssociatedAccountEntity, NonNullable<FunctionPropertyNames<AssociatedAccountEntity>>>;

export class AssociatedAccountEntity implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public accountName: string[];

    public accountValue: string[];

    public createdAt: Date;

    public updatedAt: Date;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save AssociatedAccountEntity entity without an ID");
        await store.set('AssociatedAccountEntity', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove AssociatedAccountEntity entity without an ID");
        await store.remove('AssociatedAccountEntity', id.toString());
    }

    static async get(id:string): Promise<AssociatedAccountEntity | undefined>{
        assert((id !== null && id !== undefined), "Cannot get AssociatedAccountEntity entity without an ID");
        const record = await store.get('AssociatedAccountEntity', id.toString());
        if (record){
            return AssociatedAccountEntity.create(record as AssociatedAccountEntityProps);
        }else{
            return;
        }
    }



    static create(record: AssociatedAccountEntityProps): AssociatedAccountEntity {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new AssociatedAccountEntity(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
