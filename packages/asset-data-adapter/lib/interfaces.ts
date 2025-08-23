export type AssetBalance = { [assetId: string]: AddressBalance[] };

export interface AddressBalance {
  address: string;
  balance: bigint;
}

export interface ChainAssetBalance {
  assetId: string;
  balance: bigint;
}
