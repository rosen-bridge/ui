export type EventCountStatus = 'successful' | 'fraud';

export interface AggregatedEvents {
  status: EventCountStatus;
  fromChain: string;
  toChain: string;
  eventCount: number;
  maxHeight: number;
}
