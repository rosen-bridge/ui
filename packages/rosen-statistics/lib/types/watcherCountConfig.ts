export interface WatcherCountConfig {
  type: 'node' | 'explorer';
  url: string;
  rwtRepoNFT: string;
  rwtTokenMap: Map<string, string>;
}
export interface BoxFetcher {
  assets: {
    tokenId: string;
  }[];
  additionalRegisters: Record<string, string>;
}
