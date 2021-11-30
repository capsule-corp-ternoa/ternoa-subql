v0.2.0
(this is indexer version, do not confuse with v0.2.0 / v0.2.1 which are also chain version)

Fixed
- batch handling fixed
- nfts creation handling (avoid loops)


Added
- New data for explorer :
	- blocks
	- events
	- extrinsics
	- session
	- extrinsicDescription
	- eventDescription
	- series
	- treasury
	- NFT transfer
	- Associated accounts
- series events handling (finish)
- capsules events handling (create, createFromNft, remove, addFunds, setIpfsReference)
- marketplace create events handling (create, setCommissionFee, setLogoUri, setMarketType, setName, setOwner, setUri)
- AltVR events handling (setAltvrUsername)
- nft setIpfsReference added

Changed
- Unlist now reset the price
- To handle chain runtime upgrade, we have specific repositories corresponding to the correct chain / version (eg: v0.2.0/testnet corresponds to the chain version 0.2.0 with the testnet genesis hash and endpoint)