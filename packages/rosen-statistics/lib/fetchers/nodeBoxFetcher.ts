import {
  type AbstractLogger,
  DummyLogger,
} from '@rosen-bridge/abstract-logger';
import ergoNodeClientFactory, {
  type IndexedErgoBox,
} from '@rosen-clients/ergo-node';

export class NodeBoxFetcher {
  private readonly PAGE_SIZE = 100;
  private readonly client: ReturnType<typeof ergoNodeClientFactory>;
  private readonly logger: AbstractLogger;

  constructor(url: string, logger?: AbstractLogger) {
    this.client = ergoNodeClientFactory(url);
    this.logger = logger ?? new DummyLogger();
    this.logger.debug(`NodeBoxFetcher initialized with url: ${url}`);
  }

  /**
   * Fetch all unspent boxes for a given token ID from the Node API.
   *
   * @param tokenId - Token ID to fetch boxes for
   * @returns Array of IndexedErgoBox objects representing unspent boxes
   */
  fetchUnspentBoxesByTokenId = async (
    tokenId: string,
  ): Promise<IndexedErgoBox[]> => {
    const boxes: IndexedErgoBox[] = [];
    let currentPage = 0;

    this.logger.debug(`Fetching boxes from node for token ${tokenId}`);

    while (true) {
      const offset = currentPage * this.PAGE_SIZE;

      const page = await this.client.getBoxesByTokenIdUnspent(tokenId, {
        offset,
        limit: this.PAGE_SIZE,
      });

      if (!page.length) {
        this.logger.debug('No more boxes returned from node');
        break;
      }

      boxes.push(...page);

      currentPage++;
    }

    this.logger.debug(`Fetched ${boxes.length} boxes from node`);
    return boxes;
  };
}
