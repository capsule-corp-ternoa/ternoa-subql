// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames, FieldsExpression, GetOptions } from "@subql/types-core";
import assert from 'assert';



export type TransmissionEntityProps = Omit<TransmissionEntity, NonNullable<FunctionPropertyNames<TransmissionEntity>>| '_name'>;

export class TransmissionEntity implements Entity {

    constructor(
        
        id: string,
        nftId: string,
        from: string,
        to: string,
        isActive: boolean,
        isThresholdReached: boolean,
        protocol: string,
        createdAt: Date,
        updatedAt: Date,
        timestampCreated: Date,
    ) {
        this.id = id;
        this.nftId = nftId;
        this.from = from;
        this.to = to;
        this.isActive = isActive;
        this.isThresholdReached = isThresholdReached;
        this.protocol = protocol;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.timestampCreated = timestampCreated;
        
    }

    public id: string;
    public nftId: string;
    public from: string;
    public to: string;
    public isActive: boolean;
    public isThresholdReached: boolean;
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
    public timestampRemoved?: Date;
    public timestampUpdated?: Date;
    public timestampTransmitted?: Date;
    

    get _name(): string {
        return 'TransmissionEntity';
    }

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
        if (record) {
            return this.create(record as TransmissionEntityProps);
        } else {
            return;
        }
    }

    static async getByNftId(nftId: string): Promise<TransmissionEntity[] | undefined>{
      const records = await store.getByField('TransmissionEntity', 'nftId', nftId);
      return records.map(record => this.create(record as TransmissionEntityProps));
    }


    /**
     * Gets entities matching the specified filters and options.
     *
     * ⚠️ This function will first search cache data followed by DB data. Please consider this when using order and offset options.⚠️
     * */
    static async getByFields(filter: FieldsExpression<TransmissionEntityProps>[], options?: GetOptions<TransmissionEntityProps>): Promise<TransmissionEntity[]> {
        const records = await store.getByFields('TransmissionEntity', filter, options);
        return records.map(record => this.create(record as TransmissionEntityProps));
    }

    static create(record: TransmissionEntityProps): TransmissionEntity {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new this(
            record.id,
            record.nftId,
            record.from,
            record.to,
            record.isActive,
            record.isThresholdReached,
            record.protocol,
            record.createdAt,
            record.updatedAt,
            record.timestampCreated,
        );
        Object.assign(entity,record);
        return entity;
    }
}
