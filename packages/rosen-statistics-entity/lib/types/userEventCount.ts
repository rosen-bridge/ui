export interface AggregatedUserEvents {
  fromAddress: string;
  toAddress: string;
  count: number;
  lastProcessedHeight: number;
}
