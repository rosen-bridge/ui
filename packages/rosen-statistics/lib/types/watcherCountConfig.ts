export interface WatcherCountConfig {
  type: 'node' | 'explorer';
  url: string;
  rwtTokenId: string;
  rwtNetworkMap: Record<string, string>;
}
