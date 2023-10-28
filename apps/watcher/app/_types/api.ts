import {
  HealthParamInfo,
  Paginated,
  TokenChartData,
  TokenInfo,
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
}

export type ApiAddressAssetsResponse = Paginated<TokenInfo>;

export type ApiRevenueChartResponse = TokenChartData[];

export type ApiHealthStatusResponse = HealthParamInfo[];

export interface ApiWithdrawRequestBody {
  address: string;
  tokens: {
    tokenId: string;
    amount: bigint;
  }[];
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
  status: string;
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
  WIDs: string;
  spendBlock?: string;
  spendHeight?: number;
  spendTxId?: string;
}

export type ApiEventResponse = Paginated<Event>;
