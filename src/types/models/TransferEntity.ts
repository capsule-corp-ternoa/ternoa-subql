// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames, FieldsExpression} from "@subql/types-core";
import assert from 'assert';



export type TransferEntityProps = Omit<TransferEntity, NonNullable<FunctionPropertyNames<TransferEntity>>| '_name'>;

export class TransferEntity implements Entity {

    constructor(
        
        id: string,
        blockId: string,
        blockHash: string,
        extrinsicId: string,
        isSuccess: boolean,
        timestamp: Date,
        from: string,
        to: string,
        currency: string,
        amount: string,
        amountRounded: number,
    ) {
        this.id = id;
        this.blockId = blockId;
        this.blockHash = blockHash;
        this.extrinsicId = extrinsicId;
        this.isSuccess = isSuccess;
        this.timestamp = timestamp;
        this.from = from;
        this.to = to;
        this.currency = currency;
        this.amount = amount;
        this.amountRounded = amountRounded;
        
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
    

    get _name(): string {
        return 'TransferEntity';
    }

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
        if (record) {
            return this.create(record as TransferEntityProps);
        } else {
            return;
        }
    }

    static async getByFields(filter: FieldsExpression<TransferEntityProps>[], options?: { offset?: number, limit?: number}): Promise<TransferEntity[]> {
        const records = await store.getByFields('TransferEntity', filter, options);
        return records.map(record => this.create(record as TransferEntityProps));
    }

    static create(record: TransferEntityProps): TransferEntity {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new this(
            record.id,
            record.blockId,
            record.blockHash,
            record.extrinsicId,
            record.isSuccess,
            record.timestamp,
            record.from,
            record.to,
            record.currency,
            record.amount,
            record.amountRounded,
        );
        Object.assign(entity,record);
        return entity;
    }
}
