import {
  HealthParamInfo,
  TokenChartData,
  TokenInfo,
  Paginated,
  TokenInfoWithColdAmount,
} from '@rosen-ui/types';

export interface TokenInfoWithAddress {
  address: string;
  chain: string;
  balance: TokenInfo;
}

export interface ApiInfoResponse {
  health: 'Healthy' | 'Unstable' | 'Broken';
  balances: {
    hot: TokenInfoWithAddress[];
    cold: TokenInfoWithAddress[];
  };
}

export interface GuardTokenInfo extends TokenInfoWithColdAmount {
  chain: string;
}

export type ApiRevenueChartResponse = TokenChartData[];

export interface ApiSignRequestBody {
  tx: string;
}
export type ApiSignResponse = 'OK';

export type ApiAddressAssetsResponse = Paginated<GuardTokenInfo>;

export type ApiHealthStatusResponse = HealthParamInfo[];

export interface Event {
  eventId: string;
  fromChain: string;
  toChain: string;
  fromAddress: string;
  toAddress: string;
  bridgeFee: string;
  networkFee: string;
  sourceTxId: string;
  sourceChainToken: TokenInfo;
}

export type ApiHistoryResponse = Paginated<Event>;

export type ApiEventResponse = Paginated<Event>;

export interface Revenue {
  rewardTxId: string;
  eventId: string;
  lockHeight: number;
  fromChain: string;
  toChain: string;
  fromAddress: string;
  toAddress: string;
  bridgeFee: string;
  networkFee: string;
  lockToken: TokenInfo;
  lockTxId: string;
  height: number;
  timestamp: number;
  revenues: {
    revenueType: string;
    data: TokenInfo;
  }[];
}

export type ApiRevenueResponse = Paginated<Revenue>;
