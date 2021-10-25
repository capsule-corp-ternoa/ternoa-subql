// Auto-generated , DO NOT EDIT
import {Entity} from "@subql/types";
import assert from 'assert';


export class NftTransferEntity implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public blockId: string;

    public extrinsicId: string;

    public nftId: string;

    public from: string;

    public to: string;

    public timestamp: Date;

    public typeOfTransaction: string;

    public amount: string;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save NftTransferEntity entity without an ID");
        await store.set('NftTransferEntity', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove NftTransferEntity entity without an ID");
        await store.remove('NftTransferEntity', id.toString());
    }

    static async get(id:string): Promise<NftTransferEntity | undefined>{
        assert((id !== null && id !== undefined), "Cannot get NftTransferEntity entity without an ID");
        const record = await store.get('NftTransferEntity', id.toString());
        if (record){
            return NftTransferEntity.create(record);
        }else{
            return;
        }
    }



    static create(record){
        let entity = new NftTransferEntity(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
