import { NETWORKS_KEYS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';

export type TokenChainInfoType = { tokenId: string; chain: Network };
export type TokenAddressInfoType = { tokenId: string; address: string };
export type NetworkItem = (typeof NETWORKS_KEYS)[number];
export interface TotalSupply {
  assetId: string;
  totalSupply: bigint;
}

export type AssetBalance = { [assetId: string]: AddressBalance[] };

export interface AddressBalance {
  address: string;
  balance: bigint;
}
