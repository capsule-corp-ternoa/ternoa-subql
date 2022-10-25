// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames} from "@subql/types";
import assert from 'assert';




type RentEntityProps = Omit<RentEntity, NonNullable<FunctionPropertyNames<RentEntity>>>;

export class RentEntity implements Entity {

    constructor(id: string) {
        this.id = id;
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

    public totalRentOffersRecieived?: number;

    public renterCancellationFeeType?: string;

    public renterCancellationFee?: string;

    public renterCancellationFeeRounded?: number;

    public renteeCancellationFeeType?: string;

    public renteeCancellationFee?: string;

    public renteeCancellationFeeRounded?: number;

    public timestampCreate: Date;

    public timestampStart?: Date;

    public timestampLastSubscriptionRenewal?: Date;

    public timestampLastTermsUpdate?: Date;

    public timestampLastOffer?: Date;

    public timestampEnd?: Date;

    public timestampCancel?: Date;

    public timestampRevoke?: Date;

    public timestampExpire?: Date;


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
        if (record){
            return RentEntity.create(record as RentEntityProps);
        }else{
            return;
        }
    }


    static async getByNftId(nftId: string): Promise<RentEntity[] | undefined>{
      
      const records = await store.getByField('RentEntity', 'nftId', nftId);
      return records.map(record => RentEntity.create(record as RentEntityProps));
      
    }

    static async getByRenter(renter: string): Promise<RentEntity[] | undefined>{
      
      const records = await store.getByField('RentEntity', 'renter', renter);
      return records.map(record => RentEntity.create(record as RentEntityProps));
      
    }

    static async getByRentee(rentee: string): Promise<RentEntity[] | undefined>{
      
      const records = await store.getByField('RentEntity', 'rentee', rentee);
      return records.map(record => RentEntity.create(record as RentEntityProps));
      
    }

    static async getByTimestampCreate(timestampCreate: Date): Promise<RentEntity[] | undefined>{
      
      const records = await store.getByField('RentEntity', 'timestampCreate', timestampCreate);
      return records.map(record => RentEntity.create(record as RentEntityProps));
      
    }

    static async getByTimestampStart(timestampStart: Date): Promise<RentEntity[] | undefined>{
      
      const records = await store.getByField('RentEntity', 'timestampStart', timestampStart);
      return records.map(record => RentEntity.create(record as RentEntityProps));
      
    }


    static create(record: RentEntityProps): RentEntity {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new RentEntity(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
