import { TokenChartData } from '@rosen-ui/types';

export interface ApiInfoResponse {
  health: 'Healthy' | 'Unstable' | 'Broken';
  hot: {
    address: string;
    balance: string;
  };
  cold: {
    address: string;
    balance: string;
  };
}

export type ApiRevenueChartResponse = TokenChartData[];
