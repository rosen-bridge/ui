import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import ergoExplorerClientFactory, { V1 } from '@rosen-clients/ergo-explorer';
import { Constant } from 'ergo-lib-wasm-nodejs';

export class ExplorerBoxFetcher {
  private readonly PAGE_SIZE = 100;
  private readonly client: ReturnType<typeof ergoExplorerClientFactory>;
  private readonly logger: AbstractLogger;

  constructor(url: string, logger?: AbstractLogger) {
    this.client = ergoExplorerClientFactory(url);
    this.logger = logger ?? new DummyLogger();
    this.logger.debug(`ExplorerBoxFetcher initialized with url: ${url}`);
  }

  /**
   * Fetch all unspent boxes for a given token ID from the Explorer API.
   *
   * @param tokenId - Token ID to fetch boxes for
   * @returns Array of OutputInfo objects representing unspent boxes
   */

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

  /**
   * Get the numeric value stored in a specific register of a box.
   *
   * @param box - The OutputInfo box to read the register from
   * @param key - The register key to extract the value from
   * @returns Number value decoded from the register, 0 if not present
   */
  getRegisterValue = (box: V1.OutputInfo, key: string): number => {
    const reg = box.additionalRegisters[key];
    if (!reg) return 0;
    return Number(
      Constant.decode_from_base16(reg.serializedValue).to_i64().to_str(),
    );
  };
}
