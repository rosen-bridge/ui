import { TokenChartData, TokenInfo } from '@rosen-ui/types';

export interface ApiInfoResponse {
  currentBalance: bigint;
  network: string;
  permitCount: bigint;
  health: 'Healthy' | 'Unstable' | 'Broken';
  address: string;
  rsnTokenId: string;
}

export type ApiAddressAssetsResponse = TokenInfo[];

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

export type ApiPermitReturnRequestBody = ApiPermitRequestBody;
export type ApiPermitReturnResponse = ApiPermitResponse;
