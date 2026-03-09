import { V1 } from '@rosen-clients/ergo-explorer';
import { IndexedErgoBox } from '@rosen-clients/ergo-node';

export interface WatcherCountConfig {
  type: 'node' | 'explorer';
  url: string;
  rwtRepoNFT: string;
  rwtTokenMap: Map<string, string>;
}
export type WatcherBox = V1.OutputInfo | IndexedErgoBox;
