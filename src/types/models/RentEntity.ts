// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames, FieldsExpression, GetOptions } from "@subql/types-core";
import assert from 'assert';



export type RentEntityProps = Omit<RentEntity, NonNullable<FunctionPropertyNames<RentEntity>>| '_name'>;

export class RentEntity implements Entity {

    constructor(
        
        id: string,
        nftId: string,
        hasStarted: boolean,
        hasEnded: boolean,
        hasBeenCanceled: boolean,
        isExpired: boolean,
        renter: string,
        creationBlockId: number,
        durationType: string,
        acceptanceType: string,
        renterCanRevoke: boolean,
        rentFeeType: string,
        rentFee: string,
        rentFeeRounded: number,
        timestampCreated: Date,
    ) {
        this.id = id;
        this.nftId = nftId;
        this.hasStarted = hasStarted;
        this.hasEnded = hasEnded;
        this.hasBeenCanceled = hasBeenCanceled;
        this.isExpired = isExpired;
        this.renter = renter;
        this.creationBlockId = creationBlockId;
        this.durationType = durationType;
        this.acceptanceType = acceptanceType;
        this.renterCanRevoke = renterCanRevoke;
        this.rentFeeType = rentFeeType;
        this.rentFee = rentFee;
        this.rentFeeRounded = rentFeeRounded;
        this.timestampCreated = timestampCreated;
        
    }

    public id: string;
    public nftId: string;
    public hasStarted: boolean;
    public hasEnded: boolean;
    public hasBeenCanceled: boolean;
    public isExpired: boolean;
    public renter: string;
    public rentee?: string;
    public startBlockId?: number;
    public creationBlockId: number;
    public durationType: string;
    public blockDuration?: number;
    public maxSubscriptionBlockDuration?: number;
    public isSubscriptionChangeable?: boolean;
    public nextSubscriptionRenewalBlockId?: number;
    public nbSubscriptionRenewal?: number;
    public newTermsAvailable?: boolean;
    public nbTermsUpdate?: number;
    public acceptanceType: string;
    public acceptanceList?: string[];
    public renterCanRevoke: boolean;
    public revokedBy?: string;
    public rentFeeType: string;
    public rentFee: string;
    public rentFeeRounded: number;
    public rentOffers?: string[];
    public nbRentOffers?: number;
    public totalRentOffersReceived?: number;
    public renterCancellationFeeType?: string;
    public renterCancellationFee?: string;
    public renterCancellationFeeRounded?: number;
    public renteeCancellationFeeType?: string;
    public renteeCancellationFee?: string;
    public renteeCancellationFeeRounded?: number;
    public timestampCreated: Date;
    public timestampStarted?: Date;
    public timestampLastSubscriptionRenewal?: Date;
    public timestampLastTermsUpdate?: Date;
    public timestampLastOffer?: Date;
    public timestampEnded?: Date;
    public timestampCancelled?: Date;
    public timestampRevoked?: Date;
    public timestampExpired?: Date;
    

    get _name(): string {
        return 'RentEntity';
    }

    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save RentEntity entity without an ID");
        await store.set('RentEntity', id.toString(), this);
    }

    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove RentEntity entity without an ID");
        await store.remove('RentEntity', id.toString());
    }

    static async get(id:string): Promise<RentEntity | undefined>{
        assert((id !== null && id !== undefined), "Cannot get RentEntity entity without an ID");
        const record = await store.get('RentEntity', id.toString());
        if (record) {
            return this.create(record as RentEntityProps);
        } else {
            return;
        }
    }

    static async getByNftId(nftId: string): Promise<RentEntity[] | undefined>{
      const records = await store.getByField('RentEntity', 'nftId', nftId);
      return records.map(record => this.create(record as RentEntityProps));
    }

    static async getByRenter(renter: string): Promise<RentEntity[] | undefined>{
      const records = await store.getByField('RentEntity', 'renter', renter);
      return records.map(record => this.create(record as RentEntityProps));
    }

    static async getByRentee(rentee: string): Promise<RentEntity[] | undefined>{
      const records = await store.getByField('RentEntity', 'rentee', rentee);
      return records.map(record => this.create(record as RentEntityProps));
    }


    /**
     * Gets entities matching the specified filters and options.
     *
     * ⚠️ This function will first search cache data followed by DB data. Please consider this when using order and offset options.⚠️
     * */
    static async getByFields(filter: FieldsExpression<RentEntityProps>[], options?: GetOptions<RentEntityProps>): Promise<RentEntity[]> {
        const records = await store.getByFields('RentEntity', filter, options);
        return records.map(record => this.create(record as RentEntityProps));
    }

    static create(record: RentEntityProps): RentEntity {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new this(
            record.id,
            record.nftId,
            record.hasStarted,
            record.hasEnded,
            record.hasBeenCanceled,
            record.isExpired,
            record.renter,
            record.creationBlockId,
            record.durationType,
            record.acceptanceType,
            record.renterCanRevoke,
            record.rentFeeType,
            record.rentFee,
            record.rentFeeRounded,
            record.timestampCreated,
        );
        Object.assign(entity,record);
        return entity;
    }
}
