import type { SubstrateExtrinsic } from '@subql/types'
import { Call } from '@polkadot/types/interfaces'

import { CallData, ExtrinsicHandler, ExtrinsicData } from '../handlers/types'
import { tcWrapper } from '../helpers'
import { getBatchInterruptedIndex, mapExtrinsic } from '../helpers/extrinsic'

export class ExtrinsicDispatcher {
    private handlers: Map<string, ExtrinsicHandler>

    constructor () {
        this.handlers = new Map()
    }

    public add (section: string, method: string, callback: ExtrinsicHandler) {
        this.handlers.set(`${section}_${method}`, tcWrapper<any>(callback))
    }

    public async emit (extrinsic: SubstrateExtrinsic) {
        const { extrinsic: _extrinsic } = extrinsic
        const { method, section, args } = _extrinsic.method;
        
        switch (`${section}_${method}`) {
            case 'utility_batch': {
                return this.batchHandler(extrinsic)
            }

            case 'utility_batchAll': {
                this.batchAllHandler(extrinsic)
                break
            }

            case 'sudo_sudo': {
                this.sudoHandler(extrinsic)

                break
            }

            default: {
                const callData = { section, method, args }

                return this._emit(callData, mapExtrinsic(extrinsic))
            }
        }
    }

    private async _emit (
        call: CallData,
        extrinsic: ExtrinsicData,
    ) {
        try{
            const { section, method } = call
            const key = `${section}_${method}`
            const handler = this.handlers.get(key)
            if (handler) {
                await handler(call, extrinsic)
            }
        }catch(err){
            logger.error("Error in call " + call.section+"_"+call.method)
            logger.error("Error detail " + err)
            if (err.sql) logger.error("Error detail sql " + err.sql)
        }
    }

    private batchHandler (extrinsic: SubstrateExtrinsic) {
        const { extrinsic: _extrinsic } = extrinsic
        const calls = _extrinsic.args[0] as unknown as Call[]
        const batchInterruptedIndex = getBatchInterruptedIndex(extrinsic)
        const batchMethodIndexes:any = {}

        return Promise.all(calls.map(async (call, index) => {
            const { section, method, args } = call
            const key = `${section}_${method}`
            if (batchMethodIndexes[key] === undefined){
                batchMethodIndexes[key] = 0
            }else{
                batchMethodIndexes[key] = batchMethodIndexes[key] + 1
            }
            const callData = { section, method, args, batchIndex: index, batchMethodIndex: batchMethodIndexes[key] };
            const extrinsicData = mapExtrinsic(extrinsic)
            let isExcuteSuccess = extrinsicData.isExcuteSuccess
            if (isExcuteSuccess && batchInterruptedIndex >= 0) {
                isExcuteSuccess = index < batchInterruptedIndex
            }
            return this._emit(
                callData,
                {
                    ...extrinsicData,
                    isExcuteSuccess
                }
            )
        }))
    }

    private batchAllHandler (extrinsic: SubstrateExtrinsic) {
        const { extrinsic: _extrinsic } = extrinsic
        const calls = _extrinsic.args[0] as unknown as Call[]
        const batchMethodIndexes:any = {}

        return Promise.all(calls.map(async (call, index) => {
            const { section, method, args } = call
            const key = `${section}_${method}`
            if (batchMethodIndexes[key] === undefined){
                batchMethodIndexes[key] = 0
            }else{
                batchMethodIndexes[key] = batchMethodIndexes[key] + 1
            }
            const callData = { section, method, args, batchIndex: index, batchMethodIndex: batchMethodIndexes[key] };
            const extrinsicData = mapExtrinsic(extrinsic)
            let isExcuteSuccess = extrinsicData.isExcuteSuccess
            if (isExcuteSuccess){
                return this._emit(
                    callData,
                    {
                        ...extrinsicData,
                        isExcuteSuccess
                    }
                )
            }
        }))
    }

    private sudoHandler (extrinsic: SubstrateExtrinsic) {
        const { extrinsic: _extrinsic } = extrinsic
        const call = _extrinsic.args[0] as Call
        const { section, method, args } = call
        const callData = { section, method, args };

        return this._emit(callData, mapExtrinsic(extrinsic))
    }
}
