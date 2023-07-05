import { TokenChartData } from '@rosen-ui/types';

export interface ApiInfoResponse {
  currentBalance: bigint;
  network: string;
  permitCount: bigint;
  health: 'Healthy' | 'Unstable' | 'Broken';
  address: string;
  rsnTokenId: string;
}

export interface TokenInfo {
  amount: bigint;
  decimals: number;
  name?: string;
  tokenId: string;
}
export type ApiAddressAssetsResponse = TokenInfo[];

export type ApiRevenueChartResponse = TokenChartData[];

export interface HealthParamInfo {
  id: string;
  status: 'Healthy' | 'Unstable' | 'Broken';
  lastCheck: string;
  description?: string;
}
export type ApiHealthStatusResponse = HealthParamInfo[];

export interface ApiWithdrawRequestBody {
  address: string;
  tokens: Pick<TokenInfo, 'amount' | 'tokenId'>;
}
export type ApiWithdrawResponse = 'OK';

export interface ApiPermitRequestBody {
  count: string;
}
export interface ApiPermitResponse {
  txId: string;
}

export type ApiPermitReturnRequestBody = ApiPermitRequestBody;
export type ApiPermitReturnResponse = ApiPermitResponse;

export interface Observation {
  id: number;
  fromChain: string;
  toChain: string;
  fromAddress: string;
  toAddress: string;
  height: number;
  amount: string;
  networkFee: string;
  bridgeFee: string;
  sourceChainTokenId: string;
  targetChainTokenId: string;
  sourceTxId: string;
  sourceBlockId: string;
  requestId: string;
  block: string;
  extractor: string;
}

export type ApiObservationResponse = {
  total: number;
  items: Observation[];
};
