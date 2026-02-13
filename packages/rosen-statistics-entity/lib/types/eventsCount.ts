export type eventCountStatus = 'successful' | 'fraud';

export interface AggregatedEvents {
  status: eventCountStatus;
  fromChain: string;
  toChain: string;
  eventCount: number;
  maxHeight: number;
}
