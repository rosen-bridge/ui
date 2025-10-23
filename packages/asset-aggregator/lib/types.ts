import { Network } from '@rosen-ui/types';

export type IdInfoType = { id: string };
export type TokenChainInfoType = { tokenId: string; chain: Network };
export type TokenAddressInfoType = { tokenId: string; address: string };
export type TokenIdInfoType = string | IdInfoType;
