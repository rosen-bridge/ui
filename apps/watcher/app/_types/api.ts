import {
  HealthParamInfo,
  Paginated,
  TokenChartData,
  TokenInfo,
  MutationRequestBodyWithHeaders,
} from '@rosen-ui/types';

export interface ApiInfoResponse {
  collateral: {
    erg: number;
    rsn: number;
  };
  currentBalance: number;
  network: string;
  permitsPerEvent: number;
  permitCount: {
    active: number;
    total: number;
  };
  health: 'Healthy' | 'Unstable' | 'Broken';
  address: string;
  rsnTokenId: string;
  version: string;
}

export type ApiAddressAssetsResponse = Paginated<TokenInfo>;

export type ApiRevenueChartResponse = TokenChartData[];

export type ApiHealthStatusResponse = HealthParamInfo[];

export interface ApiWithdrawRequestBodyData {
  address: string;
  tokens: {
    tokenId: string;
    amount: bigint;
  }[];
}

export type ApiWithdrawRequestBody =
  MutationRequestBodyWithHeaders<ApiWithdrawRequestBodyData>;
export interface ApiWithdrawResponse {
  txId: string;
  status: 'OK';
}

export interface ApiPermitRequestBodyData {
  count: string;
}

export type ApiPermitRequestBody =
  MutationRequestBodyWithHeaders<ApiPermitRequestBodyData>;

export interface ApiPermitResponse {
  txId: string;
}
export interface ApiPermitReturnRequestBodyData {
  count: string;
}

export type ApiPermitReturnRequestBody =
  MutationRequestBodyWithHeaders<ApiPermitReturnRequestBodyData>;

export interface ApiPermitReturnResponse {
  txIds: string[];
}

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
  lockToken: TokenInfo;
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
  lockToken: TokenInfo;
  lockTxId: string;
  height: number;
  timestamp: number;
  status: string;
  revenues: TokenInfo[];
}

export type ApiRevenueResponse = Paginated<Revenue>;

export interface Event {
  id: number;
  eventId: string;
  txId: string;
  extractor: string;
  boxId: string;
  boxSerialized: string;
  block: string;
  height: number;
  fromChain: string;
  toChain: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  bridgeFee: string;
  networkFee: string;
  sourceChainTokenId: string;
  sourceChainHeight: number;
  targetChainTokenId: string;
  sourceTxId: string;
  sourceBlockId: string;
  WIDsCount: number;
  spendBlock?: string;
  spendHeight?: number;
  spendTxId?: string;
  lockToken: TokenInfo;
}

export type ApiEventResponse = Paginated<Event>;
