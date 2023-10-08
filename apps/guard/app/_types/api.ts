import {
  HealthParamInfo,
  TokenChartData,
  TokenInfo,
  Paginated,
  Event,
} from '@rosen-ui/types';

export interface TokenInfoWithAddress {
  address: string;
  balance: TokenInfo;
}

export interface ApiInfoResponse {
  health: 'Healthy' | 'Unstable' | 'Broken';
  balances: {
    hot: TokenInfoWithAddress[];
    cold: TokenInfoWithAddress[];
  };
}

export interface GuardTokenInfo extends TokenInfo {
  chain: string;
}

export type ApiRevenueChartResponse = TokenChartData[];

export interface ApiSignRequestBody {
  tx: string;
}
export type ApiSignResponse = 'OK';

export type ApiAddressAssetsResponse = Paginated<GuardTokenInfo>;

export type ApiHealthStatusResponse = HealthParamInfo[];

export type ApiHistoryResponse = Paginated<Event>;

export type ApiEventResponse = Paginated<Event>;

export interface Revenue {
  id: number;
  rewardTxId: string;
  eventId: string;
  lockHeight: number;
  fromChain: string;
  toChain: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  bridgeFee: string;
  networkFee: string;
  lockTokenId: string;
  lockTxId: string;
  height: number;
  timestamp: number;
  status: string;
}

export type ApiRevenueResponse = Paginated<Revenue>;
