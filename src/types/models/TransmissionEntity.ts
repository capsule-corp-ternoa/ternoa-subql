// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames} from "@subql/types";
import assert from 'assert';




export type TransmissionEntityProps = Omit<TransmissionEntity, NonNullable<FunctionPropertyNames<TransmissionEntity>>>;

export class TransmissionEntity implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public nftId: string;

    public from: string;

    public to: string;

    public isActive: boolean;

    public protocol: string;

    public endBlock?: number;

    public consentList?: string[];

    public currentConsent?: string[];

    public threshold?: number;

    public cancellation?: string;

    public cancellationBlock?: number;

    public createdAt: Date;

    public updatedAt: Date;

    public timestampCreated: Date;

    public timestampCancelled?: Date;

    public timestampUpdated?: Date;

    public timestampTransmitted?: Date;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save TransmissionEntity entity without an ID");
        await store.set('TransmissionEntity', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove TransmissionEntity entity without an ID");
        await store.remove('TransmissionEntity', id.toString());
    }

    static async get(id:string): Promise<TransmissionEntity | undefined>{
        assert((id !== null && id !== undefined), "Cannot get TransmissionEntity entity without an ID");
        const record = await store.get('TransmissionEntity', id.toString());
        if (record){
            return this.create(record as TransmissionEntityProps);
        }else{
            return;
        }
    }


    static async getByNftId(nftId: string): Promise<TransmissionEntity[] | undefined>{
      
      const records = await store.getByField('TransmissionEntity', 'nftId', nftId);
      return records.map(record => this.create(record as TransmissionEntityProps));
      
    }


    static create(record: TransmissionEntityProps): TransmissionEntity {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new this(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
