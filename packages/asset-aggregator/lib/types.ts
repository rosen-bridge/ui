import { NETWORKS_KEYS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';

export type IdInfoType = { id: string };
export type TokenChainInfoType = { tokenId: string; chain: Network };
export type TokenAddressInfoType = { tokenId: string; address: string };
export type TokenIdInfoType = string | IdInfoType;
export type NetworkItem = (typeof NETWORKS_KEYS)[number];
export interface TotalSupply {
  assetId: string;
  totalSupply: bigint;
}
