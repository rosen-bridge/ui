import type { WatcherCountType } from '@rosen-ui/rosen-statistics-entity';

export interface WatcherCountConfig {
  url: string;
  rwtRepoNFT: string;
  rwtTokenMap: Map<string, string>; // Mapping of RWT token ID to its corresponding network
}
export interface WatcherCountResult {
  networkWatcherCounts: WatcherCountType[];
  totalWatchers: number;
}
