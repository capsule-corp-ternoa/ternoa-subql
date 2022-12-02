// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames} from "@subql/types";
import assert from 'assert';




type TransferEntityProps = Omit<TransferEntity, NonNullable<FunctionPropertyNames<TransferEntity>>>;

export class TransferEntity implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public blockId: string;

    public blockHash: string;

    public extrinsicId: string;

    public isSuccess: boolean;

    public timestamp: Date;

    public from: string;

    public to: string;

    public currency: string;

    public amount: string;

    public amountRounded: number;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save TransferEntity entity without an ID");
        await store.set('TransferEntity', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove TransferEntity entity without an ID");
        await store.remove('TransferEntity', id.toString());
    }

    static async get(id:string): Promise<TransferEntity | undefined>{
        assert((id !== null && id !== undefined), "Cannot get TransferEntity entity without an ID");
        const record = await store.get('TransferEntity', id.toString());
        if (record){
            return TransferEntity.create(record as TransferEntityProps);
        }else{
            return;
        }
    }



    static create(record: TransferEntityProps): TransferEntity {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new TransferEntity(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
