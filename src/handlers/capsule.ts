import { getCommonExtrinsicData } from '../helpers'
import { ExtrinsicHandler } from './types'
import { NftEntity } from "../types/models/NftEntity";

export const convertToCapsuleHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const { extrinsic: _extrinsic, events } = extrinsic
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  //TODO
  const [nftId, capsuleIpfs, frozenCaps] = call.args
  if (commonExtrinsicData.isSuccess === 1){
    logger.info('conversion to capsule :' + nftId);
    // retieve the nft
    const record = await NftEntity.get(nftId);
    if (record !== undefined) {
      try {
        record.isCapsule = true
        record.capsuleIpfs = capsuleIpfs
        record.frozenCaps = frozenCaps ? frozenCaps : "0"
        await record.save()
      } catch (e) {
        logger.error('convert nft to capsule error:' + nftId);
        logger.error('convert nft to capsule error detail: ' + e);
      }
    }
  }else{
    logger.error('convert nft to capsule error:' + nftId);
    logger.error('convert nft to capsule error detail: isExtrinsicSuccess ' + commonExtrinsicData.isSuccess);
  }
}

export const convertToNftHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
    const { extrinsic: _extrinsic, events } = extrinsic
    const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
    const [nftId] = call.args
    if (commonExtrinsicData.isSuccess === 1){
      logger.info('conversion to capsule :' + nftId);
      // retieve the nft
      const record = await NftEntity.get(nftId);
      if (record !== undefined) {
        try {
          record.isCapsule = false
          record.capsuleIpfs = null
          record.frozenCaps = "0"
          await record.save()
        } catch (e) {
          logger.error('convert capsule to nft error:' + nftId);
          logger.error('convert capsule to nft error detail: ' + e);
        }
      }
    }else{
      logger.error('convert capsule to nft error:' + nftId);
      logger.error('convert capsule to nft error detail: isExtrinsicSuccess ' + commonExtrinsicData.isSuccess);
    }
  }