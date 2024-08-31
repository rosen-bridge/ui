export type ChartPeriod = 'week' | 'month' | 'year';

export interface TokenChartData {
  title: TokenInfo;
  data: {
    label: string;
    amount: string;
  }[];
}

export interface TokenInfo {
  amount: number;
  decimals: number;
  name?: string;
  tokenId: string;
  isNativeToken: boolean;
}

export interface TokenInfoWithColdAmount extends TokenInfo {
  coldAmount?: number;
}

export interface HealthParamInfo {
  id: string;
  status: 'Healthy' | 'Unstable' | 'Broken';
  lastCheck: string;
  description?: string;
}

export interface Paginated<T> {
  total: number;
  items: T[];
}

export interface MutationRequestBodyWithHeaders<Data> {
  data: Data;
  headers: {
    [headerKey: string]: string | number;
  };
}

// This is the Rosen wrapped-value
export type RosenAmountValue = bigint;
