import { SubstrateEvent } from "@subql/types";
import { getCommonEventData, formatString, roundPrice } from "../helpers";
import { CollectionEntity, NftEntity } from "../types";
import { genericTransferHandler, nftOperationEntityHandler } from ".";

export const nftsCreatedHandler = async (
	event: SubstrateEvent
): Promise<void> => {
	const commonEventData = getCommonEventData(event);
	if (!commonEventData.isSuccess)
		throw new Error("NFT created error, extrinsic isSuccess : false");
	const [
		nftId,
		owner,
		offchainData,
		royalty,
		collectionId,
		isSoulbound,
		mintFee,
	] = event.event.data;
	let record = await NftEntity.get(nftId.toString());
	if (record === undefined) {
		record = new NftEntity(nftId.toString());
		const date = new Date();
		record.nftId = nftId.toString();
		record.collectionId = collectionId ? collectionId.toString() : null;
		record.owner = owner.toString();
		record.creator = owner.toString();
		record.offchainData = offchainData.toString();
		record.royalty = Number(royalty) / 10000;
		record.mintFee = mintFee.toString();
		record.mintFeeRounded = roundPrice(record.mintFee);
		record.isCapsule = false;
		record.listedForSale = false;
		record.isSecret = false;
		record.isDelegated = false;
		record.isSoulbound = Boolean(isSoulbound);
		record.createdAt = date;
		record.updatedAt = date;
		record.timestampCreate = commonEventData.timestamp;
		await record.save();
		if (record.collectionId) {
			let collectionRecord = await CollectionEntity.get(
				record.collectionId
			);
			collectionRecord.nftsId.push(record.nftId);
			await collectionRecord.save();
		}
		await nftOperationEntityHandler(
			record,
			"null address",
			commonEventData,
			"creation"
		);
		await genericTransferHandler(
			owner,
			"Treasury",
			mintFee,
			commonEventData
		);
	}
};

export const nftsBurnedHandler = async (
	event: SubstrateEvent
): Promise<void> => {
	const commonEventData = getCommonEventData(event);
	if (!commonEventData.isSuccess)
		throw new Error("NFT burned error, extrinsic isSuccess : false");
	const [nftId] = event.event.data;
	const date = new Date();
	const record = await NftEntity.get(nftId.toString());
	if (record === undefined) throw new Error("NFT to burn not found in db");
	const oldOwner = record.owner;
	// record.listed = 0;
	// record.marketplaceId = null;
	record.owner = "null address";
	record.timestampBurn = commonEventData.timestamp;
	record.updatedAt = date;
	await record.save();
	await nftOperationEntityHandler(record, oldOwner, commonEventData, "burn");
};

export const nftsTransferHandler = async (
	event: SubstrateEvent
): Promise<void> => {
	const commonEventData = getCommonEventData(event);
	if (!commonEventData.isSuccess)
		throw new Error("NFT transfer error, extrinsic isSuccess : false");
	const [nftId, from, to] = event.event.data;
	const date = new Date();
	const record = await NftEntity.get(nftId.toString());
	if (record === undefined)
		throw new Error("NFT to transfer not found in db");
	// record.listed = 0;
	// record.marketplaceId = null;
	record.owner = to.toString();
	record.updatedAt = date;
	await record.save();
	await nftOperationEntityHandler(
		record,
		from.toString(),
		commonEventData,
		"transfer"
	);
};

// export const nftsSeriesFinishedHandler = async (
// 	event: SubstrateEvent
// ): Promise<void> => {
// 	const commonEventData = getCommonEventData(event);
// 	if (!commonEventData.isSuccess)
// 		throw new Error(
// 			"NFT series finished error, extrinsic isSuccess : false"
// 		);
// 	const [seriesId] = event.event.data;
// 	const date = new Date();
// 	let record = await SerieEntity.get(seriesId.toString());
// 	if (record === undefined)
// 		record = await SerieEntity.get(formatString(seriesId.toString()));
// 	if (record === undefined)
// 		throw new Error("Series to finish not found in db");
// 	record.locked = true;
// 	record.updatedAt = date;
// 	await record.save();
// };

export const nftsLentHandler = async (event: SubstrateEvent): Promise<void> => {
	const commonEventData = getCommonEventData(event);
	if (!commonEventData.isSuccess)
		throw new Error("NFT lent error, extrinsic isSuccess : false");
	const [id, viewer] = event.event.data;
	const date = new Date();
	let record = await NftEntity.get(id.toString());
	if (record === undefined) throw new Error("NFT to lend not found in db");
	// record.viewer =
	// 	viewer && viewer.toString().length > 0 ? viewer.toString() : null;
	record.updatedAt = date;
	await record.save();
};
