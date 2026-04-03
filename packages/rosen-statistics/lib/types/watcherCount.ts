import { V1 } from '@rosen-clients/ergo-explorer';
import { IndexedErgoBox } from '@rosen-clients/ergo-node';
import { WatcherCountType } from '@rosen-ui/rosen-statistics-entity';

export interface WatcherCountConfig {
  type: 'node' | 'explorer';
  url: string;
  rwtRepoNFT: string;
  rwtTokenMap: Map<string, string>; // Mapping of RWT token ID to its corresponding network
}
export type WatcherBoxType = V1.OutputInfo | IndexedErgoBox;

export interface WatcherCountResult {
  networkWatcherCounts: WatcherCountType[];
  totalWatchers: number;
}
