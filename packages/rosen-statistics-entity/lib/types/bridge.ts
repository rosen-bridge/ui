export interface BridgeMetricRecord {
  fromChain: string;
  amount: number;
  day: number;
  week: number;
  month: number;
  year: number;
  lastProcessedHeight: number;
}

export interface BridgeEventData {
  fromChain: string;
  bridgeFee: string;
  bridgeAmount: string;
  tokenId: string;
  timestamp: number;
  height: number;
  day: number;
  month: number;
  year: number;
  decimal: number;
}
