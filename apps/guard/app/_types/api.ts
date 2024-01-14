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
  rsnTokenId: string;
  balances: {
    hot: TokenInfoWithAddress[];
    cold: TokenInfoWithAddress[];
  };
}

export interface GuardTokenInfo extends TokenInfoWithColdAmount {
  chain: string;
}

interface GuardTokenChartData extends Omit<TokenChartData, 'title'> {
  title: TokenInfo;
}
export type ApiRevenueChartResponse = GuardTokenChartData[];

export interface ApiSignRequestBody {
  chain: string;
  txJson: string;
  requiredSign: number;
  overwrite?: boolean;
}
export type ApiSignResponse = {
  message: string;
};

export type ApiAddressAssetsResponse = Paginated<GuardTokenInfo>;

export type ApiHealthStatusResponse = HealthParamInfo[];

export interface EventBase {
  eventId: string;
  fromChain: string;
  toChain: string;
  fromAddress: string;
  toAddress: string;
  bridgeFee: string;
  networkFee: string;
  sourceTxId: string;
  sourceChainToken: TokenInfo;
  status: string;
}

export interface HistoryEvent extends EventBase {
  paymentTxId: string;
  rewardTxId: string;
}

export interface OngoingEvent extends EventBase {
  txId: string;
}

export type ApiHistoryResponse = Paginated<HistoryEvent>;

export type ApiEventResponse = Paginated<OngoingEvent>;

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
  ergoSideTokenId: string;
  lockTxId: string;
  height: number;
  timestamp: number;
  revenues: {
    revenueType: string;
    data: TokenInfo;
  }[];
}

export type ApiRevenueResponse = Paginated<Revenue>;
