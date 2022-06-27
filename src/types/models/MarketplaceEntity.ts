// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames} from "@subql/types";
import assert from 'assert';




export class MarketplaceEntity implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public marketplaceId: string;

    public owner: string;

    public kind: string;

    public commissionFee?: string;

    public listingFee?: string;

    public accountList?: string[];

    public offchainData?: string;

    public createdAt: Date;

    public updatedAt: Date;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save MarketplaceEntity entity without an ID");
        await store.set('MarketplaceEntity', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove MarketplaceEntity entity without an ID");
        await store.remove('MarketplaceEntity', id.toString());
    }

    static async get(id:string): Promise<MarketplaceEntity | undefined>{
        assert((id !== null && id !== undefined), "Cannot get MarketplaceEntity entity without an ID");
        const record = await store.get('MarketplaceEntity', id.toString());
        if (record){
            return MarketplaceEntity.create(record);
        }else{
            return;
        }
    }



    static create(record: Partial<Omit<MarketplaceEntity, FunctionPropertyNames<MarketplaceEntity>>> & Entity): MarketplaceEntity {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new MarketplaceEntity(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
