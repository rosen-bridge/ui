export interface ApiInfoResponse {
  currentBalance: bigint;
  network: string;
  permitCount: bigint;
  health: 'Healthy' | 'Unstable' | 'Broken';
  address: string;
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
