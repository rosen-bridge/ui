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

export interface Event {
  id: number;
  eventId: string;
  txId: string;
  extractor: string;
  boxId: string;
  boxSerialized: string;
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
  sourceChainHeight: number;
  targetChainTokenId: string;
  sourceTxId: string;
  sourceBlockId: string;
  WIDs: string;
  spendBlock?: string;
  spendHeight?: number;
  spendTxId?: string;
}

export type ValueOf<T> = T[keyof T];
