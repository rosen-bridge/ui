import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import JsonBigInt from '@rosen-bridge/json-bigint';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import ergoNodeClientFactory from '@rosen-clients/ergo-node';
import { ErgoBox } from 'ergo-lib-wasm-nodejs';

import { WatcherCountConfig } from '../types';

export class WatcherBoxService {
  private readonly BOX_FETCHING_PAGE_SIZE = 100;
  private readonly config: WatcherCountConfig;
  private readonly logger: AbstractLogger;

  protected explorerClient?: ReturnType<typeof ergoExplorerClientFactory>;
  protected nodeClient?: ReturnType<typeof ergoNodeClientFactory>;

  /**
   * Create WatcherBoxService instance
   *
   * @param config - Watcher count configuration
   * @param logger - Optional logger instance
   */
  constructor(config: WatcherCountConfig, logger?: AbstractLogger) {
    this.config = config;
    this.logger = logger ?? new DummyLogger();

    if (config.type === 'explorer') {
      this.explorerClient = ergoExplorerClientFactory(config.url);
      this.logger.debug(
        `WatcherBoxService initialized using explorer client: ${config.url}`,
      );
    } else {
      this.nodeClient = ergoNodeClientFactory(config.url);
      this.logger.debug(
        `WatcherBoxService initialized using node client: ${config.url}`,
      );
    }
  }

  /**
   * Fetch all watcher boxes from external API
   *
   * @returns Promise resolving to array of ErgoBox
   */
  fetchWatcherBoxes = async (): Promise<ErgoBox[]> => {
    this.logger.debug('Fetching watcher boxes started');

    if (this.explorerClient) {
      return this.fetchBoxesUsingExplorer();
    }

    if (this.nodeClient) {
      return this.fetchBoxesUsingNode();
    }
    throw new Error('No client configured for fetching boxes');
  };

  /**
   * Extract watcher count from a box
   *
   * @param box - ErgoBox to extract count from
   * @returns Extracted watcher count
   */
  extractWatcherCount = (box: ErgoBox): number => {
    try {
      const count = Number(
        box.register_value(this.config.watcherRegister)?.to_i64().to_str(),
      );

      this.logger.debug(`Extracted watcher count: ${count}`);
      return count;
    } catch {
      this.logger.debug(
        'Failed to extract watcher count from box, defaulting to 0',
      );
      return 0;
    }
  };

  /**
   * Extract network identifier from a box based on RWT token
   *
   * @param box - ErgoBox to extract network from
   * @returns Network identifier or undefined if not matched
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
          this.logger.debug(
            `Matched network '${network}' for tokenId ${tokenId}`,
          );
          return network;
        }
      }
    }

    this.logger.debug('No matching network found for box');
    return undefined;
  };

  /**
   * Fetch watcher boxes using Ergo Explorer API
   *
   * @returns Promise resolving to array of ErgoBox
   */
  protected fetchBoxesUsingExplorer = async (): Promise<ErgoBox[]> => {
    if (!this.explorerClient) {
      throw new Error('Explorer client not initialized');
    }
    const boxes: ErgoBox[] = [];
    let currentPage = 0;

    this.logger.debug(
      `Fetching boxes from explorer for token ${this.config.rwtTokenId}`,
    );

    while (true) {
      const offset = currentPage * this.BOX_FETCHING_PAGE_SIZE;

      this.logger.debug(
        `Explorer fetch page ${currentPage} (offset=${offset})`,
      );

      const page = await this.explorerClient.v1.getApiV1BoxesUnspentBytokenidP1(
        this.config.rwtTokenId,
        {
          offset,
          limit: this.BOX_FETCHING_PAGE_SIZE,
        },
      );

      if (!page.items?.length) {
        this.logger.debug('No more boxes returned from explorer');
        break;
      }

      boxes.push(
        ...page.items.map((box) =>
          ErgoBox.from_json(JsonBigInt.stringify(box)),
        ),
      );

      currentPage++;
    }

    this.logger.debug(`Fetched ${boxes.length} boxes from explorer`);
    return boxes;
  };

  /**
   * Fetch watcher boxes using Ergo Node API
   *
   * @returns Promise resolving to array of ErgoBox
   */
  protected fetchBoxesUsingNode = async (): Promise<ErgoBox[]> => {
    if (!this.nodeClient) {
      throw new Error('Node client not initialized');
    }
    const boxes: ErgoBox[] = [];
    let currentPage = 0;

    this.logger.debug(
      `Fetching boxes from node for token ${this.config.rwtTokenId}`,
    );

    while (true) {
      const offset = currentPage * this.BOX_FETCHING_PAGE_SIZE;
      this.logger.debug(`Node fetch page ${currentPage} (offset=${offset})`);
      const page = await this.nodeClient.getBoxesByTokenIdUnspent(
        this.config.rwtTokenId,
        {
          offset,
          limit: this.BOX_FETCHING_PAGE_SIZE,
        },
      );
      if (!page.length) {
        this.logger.debug('No more boxes returned from node');
        break;
      }
      boxes.push(
        ...page.map((box) => ErgoBox.from_json(JsonBigInt.stringify(box))),
      );
      currentPage++;
    }
    this.logger.debug(`Fetched ${boxes.length} boxes from node`);
    return boxes;
  };
}
