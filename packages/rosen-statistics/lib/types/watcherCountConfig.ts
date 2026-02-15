export interface WatcherCountConfig {
  type: 'node' | 'explorer';
  url: string;
  rwtTokenId: string;
  watcherRegister: number;
  rwtNetworkMap: Record<string, string>;
}
