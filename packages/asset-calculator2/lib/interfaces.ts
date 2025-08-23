export interface AssetBalance {
  assetId: string;
  addressBalance: AddressBalance[];
}

export interface AddressBalance {
  address: string;
  balance: bigint;
}

export interface ChainAssetBalance {
  assetId: string;
  balance: bigint;
}
