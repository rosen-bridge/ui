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
    let total = 0;
    let offset = 0;

    this.logger.debug(`Fetching boxes from explorer for token ${tokenId}`);

    do {
      const page = await this.client.v1.getApiV1BoxesUnspentBytokenidP1(
        tokenId,
        {
          offset,
          limit: this.PAGE_SIZE,
        },
      );

      const items = page.items ?? [];
      boxes.push(...items);

      total = page.total ?? 0;

      this.logger.debug(
        `Fetched page: offset=${offset}, received=${items.length}, total=${total}`,
      );

      offset += this.PAGE_SIZE;
    } while (offset < total);

    this.logger.debug(`Fetched ${boxes.length} boxes from explorer`);
    return boxes;
  };

  /**
   * Get the numeric value stored in a specific register of a box.
   *
   * @param box - The OutputInfo box to read the register from
   * @param key - The register key to extract the value from
   * @returns Number value decoded from the register, undefined if not present
   */
  getRegisterValue = (box: V1.OutputInfo, key: string): number | undefined => {
    const reg = box.additionalRegisters[key];
    if (!reg) return undefined;

    try {
      const decoded = Constant.decode_from_base16(reg.serializedValue)
        .to_i64()
        .to_str();

      return Number(decoded);
    } catch (err) {
      this.logger.warn(
        `Failed to decode register ${key} with value ${reg.serializedValue}: ${err}`,
      );
      return undefined;
    }
  };
}
