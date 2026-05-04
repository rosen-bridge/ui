export interface AggregatedUserEvents {
  fromAddress: string;
  toAddress: string;
  fromChain: string;
  toChain: string;
  count: number;
  lastProcessedHeight: number;
}
