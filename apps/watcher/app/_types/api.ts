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

export interface TokenChartData {
  title: string;
  data: {
    label: string;
    amount: string;
  }[];
}
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
