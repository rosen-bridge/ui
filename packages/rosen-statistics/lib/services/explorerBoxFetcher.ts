import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import ergoExplorerClientFactory, { V1 } from '@rosen-clients/ergo-explorer';

export class ExplorerBoxFetcher {
  private readonly PAGE_SIZE = 100;
  private readonly client: ReturnType<typeof ergoExplorerClientFactory>;
  private readonly logger: AbstractLogger;

  constructor(url: string, logger?: AbstractLogger) {
    this.client = ergoExplorerClientFactory(url);
    this.logger = logger ?? new DummyLogger();
    this.logger.debug(`ExplorerBoxFetcher initialized with url: ${url}`);
  }

  fetchUnspentBoxesByTokenId = async (
    tokenId: string,
  ): Promise<V1.OutputInfo[]> => {
    const boxes: V1.OutputInfo[] = [];
    let currentPage = 0;

    this.logger.debug(`Fetching boxes from explorer for token ${tokenId}`);

    while (true) {
      const offset = currentPage * this.PAGE_SIZE;

      const page = await this.client.v1.getApiV1BoxesUnspentBytokenidP1(
        tokenId,
        {
          offset,
          limit: this.PAGE_SIZE,
        },
      );

      if (!page.items?.length) {
        this.logger.debug('No more boxes returned from explorer');
        break;
      }

      boxes.push(...page.items);

      currentPage++;
    }

    this.logger.debug(`Fetched ${boxes.length} boxes from explorer`);
    return boxes;
  };
}
