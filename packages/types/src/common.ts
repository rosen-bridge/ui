export type ChartPeriod = 'week' | 'month' | 'year';

export interface TokenChartData {
  title: string;
  data: {
    label: string;
    amount: string;
  }[];
}

export interface TokenInfo {
  amount: bigint;
  decimals: number;
  name?: string;
  tokenId: string;
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
