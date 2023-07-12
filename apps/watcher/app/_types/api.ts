import {
  HealthParamInfo,
  Paginated,
  TokenChartData,
  TokenInfo,
} from '@rosen-ui/types';

export interface ApiInfoResponse {
  currentBalance: bigint;
  network: string;
  permitCount: bigint;
  health: 'Healthy' | 'Unstable' | 'Broken';
  address: string;
  rsnTokenId: string;
}

export type ApiAddressAssetsResponse = TokenInfo[];

export type ApiRevenueChartResponse = TokenChartData[];

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

export type ApiObservationResponse = Paginated<Observation>;

export interface Revenue {
  id: number;
  permitTxId: string;
  eventId: string;
  lockHeight: number;
  fromChain: string;
  toChain: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  bridgeFee: string;
  networkFee: string;
  tokenId: string;
  lockTxId: string;
  height: number;
  timestamp: number;
  status: string;
}

export type ApiRevenueResponse = Paginated<Revenue>;
