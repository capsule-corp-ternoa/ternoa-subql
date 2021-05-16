// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Auto-generated , DO NOT EDIT
import {Entity} from "@subql/types";
import assert from 'assert';

export class NftEntity implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public nftId?: string;

    public uri?: string;

    public timestampList?: Date;

    public currency: string;

    public price?: string;

    public listed: number;

    public timestampBurn?: Date;

    public owner: string;

    public creator: string;

    public serieId: string;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save NftEntity entity without an ID");
        await store.set('NftEntity', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove NftEntity entity without an ID");
        await store.remove('NftEntity', id.toString());
    }

    static async get(id:string): Promise<NftEntity>{
        assert(id !== null, "Cannot get NftEntity entity without an ID");
        const record = await store.get('NftEntity', id.toString());
        if (record){
            return NftEntity.create(record);
        }else{
            return;
        }
    }

    static create(record){
        let entity = new NftEntity(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
