import { NETWORKS_KEYS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';

import { BITCOIN_RUNES_NETWORKS_KEY } from './constants';

export type IdInfoType = { id: string };
export type TokenChainInfoType = { tokenId: string; chain: Network };
export type TokenAddressInfoType = { tokenId: string; address: string };
export type TokenIdInfoType = string | IdInfoType;
// TODO: implement Bitcoin-Runes support later
export type NetworkItem = Exclude<
  (typeof NETWORKS_KEYS)[number],
  typeof BITCOIN_RUNES_NETWORKS_KEY
>;

export interface TotalSupply {
  assetId: string;
  totalSupply: bigint;
}
