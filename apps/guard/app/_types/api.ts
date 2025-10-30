import {
  HealthParamInfo,
  TokenChartData,
  TokenInfo,
  Paginated,
  TokenInfoWithColdAmount,
  MutationRequestBodyWithHeaders,
  Network,
} from '@rosen-ui/types';

export interface TokenInfoWithAddress {
  address: string;
  chain: Network;
  balance: TokenInfo;
}

export interface ApiInfoResponse {
  health: {
    status: 'Healthy' | 'Unstable' | 'Broken';
    trialErrors: string[];
  };
  rsnTokenId: string;
  emissionTokenId: string;
  versions: {
    app: string;
    contract: string;
    tokensMap: string;
  };
}

export interface ApiBalanceResponse {
  hot: {
    items: TokenInfoWithAddress[];
    total: number;
  };
  cold: {
    items: TokenInfoWithAddress[];
    total: number;
  };
}

export interface GuardTokenInfo extends TokenInfoWithColdAmount {
  chain: Network;
}

interface GuardTokenChartData extends Omit<TokenChartData, 'title'> {
  title: TokenInfo;
}
export type ApiRevenueChartResponse = GuardTokenChartData[];

export interface ApiSignRequestBodyData {
  chain: Network;
  txJson: string;
  requiredSign: number;
  overwrite?: boolean;
}

export interface ApiOrderRequestBodyData {
  id: string;
  chain: Network;
  orderJson: string;
}

export type ApiSignRequestBody =
  MutationRequestBodyWithHeaders<ApiSignRequestBodyData>;

export type ApiOrderRequestBody =
  MutationRequestBodyWithHeaders<ApiOrderRequestBodyData>;

export type ApiSignResponse = {
  message: string;
};

export type ApiOrderResponse = {
  message: string;
};

export type ApiAddressAssetsResponse = Paginated<GuardTokenInfo>;

export type ApiHealthStatusResponse = HealthParamInfo[];

export interface EventBase {
  eventId: string;
  fromChain: Network;
  toChain: Network;
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
  fromChain: Network;
  toChain: Network;
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
