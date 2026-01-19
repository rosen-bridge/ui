import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import JsonBigInt from '@rosen-bridge/json-bigint';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import ergoNodeClientFactory from '@rosen-clients/ergo-node';
import { ErgoBox } from 'ergo-lib-wasm-nodejs';

import { METRIC_KEYS, RWT_NETWORK_MAP } from '../constants';
import { WatcherCountEntity } from '../entities';
import { WatcherCountConfig } from '../types';
import { MetricAction } from './MetricAction';

export class WatcherCountMetricAction {
  protected readonly BOX_FETCHING_PAGE_SIZE = 100;

  protected readonly watcherRepo: Repository<WatcherCountEntity>;
  protected readonly metricAction: MetricAction;
  protected readonly logger: AbstractLogger;
  protected readonly config: WatcherCountConfig;

  protected explorerClient: ReturnType<typeof ergoExplorerClientFactory>;
  protected nodeClient: ReturnType<typeof ergoNodeClientFactory>;

  constructor(
    dataSource: DataSource,
    config: WatcherCountConfig,
    logger?: AbstractLogger,
  ) {
    this.watcherRepo = dataSource.getRepository(WatcherCountEntity);
    this.metricAction = new MetricAction(dataSource, logger);
    this.logger = logger ?? new DummyLogger();
    this.config = config;

    if (config.type === 'explorer')
      this.explorerClient = ergoExplorerClientFactory(config.url);
    else this.nodeClient = ergoNodeClientFactory(config.url);
  }

  async calculateAndStoreWatcherCounts(): Promise<void> {
    const timestamp = Math.floor(Date.now() / 1000);
    this.logger.debug(`Calculating user counts at timestamp: [${timestamp}]`);

    const boxes = this.explorerClient
      ? await this.fetchBoxesUsingExplorer()
      : await this.fetchBoxesUsingNode();

    const networkWatcherCounts: Record<string, number> = {};

    for (const box of boxes) {
      const watcherCount = this.extractWatcherCount(box);
      if (!watcherCount) continue;

      const network = this.extractNetwork(box);
      if (!network) continue;

      networkWatcherCounts[network] = watcherCount;
    }

    for (const [network, count] of Object.entries(networkWatcherCounts)) {
      const existing = await this.watcherRepo.findOne({ where: { network } });
      if (existing) {
        existing.count = count;
        await this.watcherRepo.save(existing);
      } else {
        await this.watcherRepo.save(
          this.watcherRepo.create({ network, count }),
        );
      }
    }

    const totalWatchers = Object.values(networkWatcherCounts).reduce(
      (a: number, b: number) => a + b,
      0,
    );

    await this.metricAction.upsertMetric(
      METRIC_KEYS.WATCHER_COUNT_TOTAL,
      totalWatchers.toString(),
      timestamp,
    );

    this.logger.info(`WatcherCount updated. Total watchers: ${totalWatchers}`);
  }

  protected fetchBoxesUsingExplorer = async (): Promise<Array<ErgoBox>> => {
    const boxes: ErgoBox[] = [];
    let currentPage = 0;

    try {
      while (true) {
        const page =
          await this.explorerClient!.v1.getApiV1BoxesUnspentBytokenidP1(
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
    } catch (error) {
      this.logger.error(`Error fetching boxes from explorer: ${error}`, {
        message: error instanceof Error ? error.message : error,
        stack: error instanceof Error && error.stack ? error.stack : undefined,
      });
      throw new Error(`Failed to fetch watcher boxes from explorer: ${error}`);
    }

    return boxes;
  };

  protected fetchBoxesUsingNode = async (): Promise<Array<ErgoBox>> => {
    const boxes: ErgoBox[] = [];
    let currentPage = 0;

    try {
      while (true) {
        const page = await this.nodeClient!.getBoxesByTokenIdUnspent(
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
    } catch (error) {
      this.logger.error(`Error fetching boxes from node: ${error}`, {
        message: error instanceof Error ? error.message : error,
        stack: error instanceof Error && error.stack ? error.stack : undefined,
      });
      throw new Error(`Failed to fetch watcher boxes from node: ${error}`);
    }
    return boxes;
  };

  protected extractWatcherCount = (box: ErgoBox): number => {
    try {
      return Number(box.register_value(5)?.to_i64().to_str());
    } catch {
      return 0;
    }
  };

  protected extractNetwork = (box: ErgoBox): string | undefined => {
    const tokens = box.tokens();
    for (let i = 0; i < tokens.len(); i++) {
      const token = tokens.get(i);
      if (token && token.id().to_str() in RWT_NETWORK_MAP)
        return RWT_NETWORK_MAP[token.id().to_str()];
    }
    return undefined;
  };
}
