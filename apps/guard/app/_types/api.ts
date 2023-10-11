import {
  HealthParamInfo,
  TokenChartData,
  TokenInfo,
  Paginated,
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

export interface Event {
  eventId: string;
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
  targetChainTokenId: string;
  sourceChainHeight: number;
  sourceBlockId: string;
  sourceTxId: string;
  WIDs: string;
}

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
