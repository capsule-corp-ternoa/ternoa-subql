import { NftEntity, NftOperationEntity } from "../types";
import { CommonEventData } from "../helpers";

export const nftOperationEntityHandler = async (
	record: NftEntity,
	oldOwner: string,
	commonEventData: CommonEventData,
	typeOfTransaction: string
): Promise<void> => {
	const nftOperationRecord = new NftOperationEntity(
		commonEventData.blockHash + "-" + commonEventData.eventId
	);
	nftOperationRecord.blockId = commonEventData.blockId;
	nftOperationRecord.extrinsicId = commonEventData.extrinsicId;
	nftOperationRecord.nftId = record.id;
	nftOperationRecord.from = oldOwner;
	nftOperationRecord.to =
		typeOfTransaction !== "burn" ? record.owner : "null address";
	nftOperationRecord.timestamp = commonEventData.timestamp;
	nftOperationRecord.typeOfTransaction = typeOfTransaction;
	await nftOperationRecord.save();
};
