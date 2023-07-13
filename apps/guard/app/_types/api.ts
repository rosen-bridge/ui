import {
  HealthParamInfo,
  TokenChartData,
  TokenInfo,
  Paginated,
  Event,
} from '@rosen-ui/types';

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

export interface ApiSignRequestBody {
  tx: string;
}
export type ApiSignResponse = 'OK';

export type ApiAddressAssetsResponse = TokenInfo[];

export type ApiHealthStatusResponse = HealthParamInfo[];

export type ApiHistoryResponse = Paginated<Event>;

export type ApiEventResponse = Paginated<Event>;
