import { getCommonExtrinsicData } from '../helpers'
import { ExtrinsicHandler } from './types'
import { SerieEntity } from '../types';

export const lockSerieHandler: ExtrinsicHandler = async (call, extrinsic): Promise<void> => {
  const { extrinsic: _extrinsic, events } = extrinsic
  const commonExtrinsicData = getCommonExtrinsicData(call, extrinsic)
  //TODO
  const [serieId] = call.args
  if (commonExtrinsicData.isSuccess === 1){
    logger.info('locking serie :' + serieId);
    // retieve the nft
    const record = await SerieEntity.get(serieId);
    if (record !== undefined) {
      try {
        record.locked = true
         await record.save()
      } catch (e) {
        logger.error('locking serie error:' + serieId);
        logger.error('locking serie error detail: ' + e);
      }
    }
  }else{
    logger.error('locking serie error:' + serieId);
    logger.error('locking serie error detail: isExtrinsicSuccess ' + commonExtrinsicData.isSuccess);
  }
}