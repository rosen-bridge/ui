import JsonBigInt from '@rosen-bridge/json-bigint';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import ergoNodeClientFactory from '@rosen-clients/ergo-node';
import { ErgoBox } from 'ergo-lib-wasm-nodejs';

import { WatcherCountConfig } from '../types';

export class WatcherBoxService {
  protected readonly BOX_FETCHING_PAGE_SIZE = 100;
  protected readonly config: WatcherCountConfig;

  protected explorerClient?: ReturnType<typeof ergoExplorerClientFactory>;
  protected nodeClient?: ReturnType<typeof ergoNodeClientFactory>;

  constructor(config: WatcherCountConfig) {
    this.config = config;

    if (config.type === 'explorer') {
      this.explorerClient = ergoExplorerClientFactory(config.url);
    } else {
      this.nodeClient = ergoNodeClientFactory(config.url);
    }
  }

  /**
   * Fetch all watcher boxes from external API
   *
   * @returns Promise resolving to array of ErgoBox
   */
  fetchWatcherBoxes = async (): Promise<ErgoBox[]> => {
    if (this.explorerClient) {
      return this.fetchBoxesUsingExplorer();
    } else if (this.nodeClient) {
      return this.fetchBoxesUsingNode();
    } else {
      throw new Error('No client configured for fetching boxes');
    }
  };

  /**
   * Extract watcher count from a box
   *
   * @param box - ErgoBox to extract count from
   * @returns Watcher count
   */
  extractWatcherCount = (box: ErgoBox): number => {
    try {
      return Number(box.register_value(5)?.to_i64().to_str());
    } catch {
      return 0;
    }
  };

  /**
   * Extract network identifier from a box
   *
   * @param box - ErgoBox to extract network from
   * @returns Network identifier or undefined
   */
  extractNetwork = (box: ErgoBox): string | undefined => {
    const tokens = box.tokens();
    for (let i = 0; i < tokens.len(); i++) {
      const token = tokens.get(i);
      if (!token) continue;

      const tokenId = token.id().to_str();

      for (const [network, rwtTokenId] of Object.entries(
        this.config.rwtNetworkMap,
      )) {
        if (rwtTokenId === tokenId) {
          return network;
        }
      }
    }

    return undefined;
  };

  protected fetchBoxesUsingExplorer = async (): Promise<Array<ErgoBox>> => {
    const boxes: ErgoBox[] = [];
    let currentPage = 0;

    if (!this.explorerClient) {
      throw new Error('Explorer client not initialized');
    }

    while (true) {
      const page = await this.explorerClient.v1.getApiV1BoxesUnspentBytokenidP1(
        this.config.rwtTokenId,
        {
          offset: currentPage * this.BOX_FETCHING_PAGE_SIZE,
          limit: this.BOX_FETCHING_PAGE_SIZE,
        },
      );

      if (!page.items?.length) break;

      boxes.push(
        ...page.items.map((box) =>
          ErgoBox.from_json(JsonBigInt.stringify(box)),
        ),
      );

      currentPage++;
    }

    return boxes;
  };

  protected fetchBoxesUsingNode = async (): Promise<Array<ErgoBox>> => {
    const boxes: ErgoBox[] = [];
    let currentPage = 0;

    if (!this.nodeClient) {
      throw new Error('Node client not initialized');
    }

    while (true) {
      const page = await this.nodeClient.getBoxesByTokenIdUnspent(
        this.config.rwtTokenId,
        {
          offset: currentPage * this.BOX_FETCHING_PAGE_SIZE,
          limit: this.BOX_FETCHING_PAGE_SIZE,
        },
      );

      if (!page.length) break;

      boxes.push(
        ...page.map((box) => ErgoBox.from_json(JsonBigInt.stringify(box))),
      );

      currentPage++;
    }

    return boxes;
  };
}
