import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';

import { WatcherCountEntity } from '../entities';

export class WatcherCountMetricAction {
  protected readonly watcherRepo: Repository<WatcherCountEntity>;
  readonly logger: AbstractLogger;

  constructor(dataSource: DataSource, logger?: AbstractLogger) {
    this.watcherRepo = dataSource.getRepository(WatcherCountEntity);
    this.logger = logger ?? new DummyLogger();
    this.logger.debug('WatcherCountMetricAction initialized');
  }

  /**
   * Get watcher count for specific network
   *
   * @param network - Network identifier
   * @returns Promise resolving to WatcherCountEntity or null
   */
  getWatcherCountByNetwork = async (network: string) => {
    this.logger.debug(`Fetching watcher count for network: ${network}`);
    try {
      const record = await this.watcherRepo.findOne({
        where: { network },
      });
      return record;
    } catch (error) {
      this.logger.debug(
        `Failed to fetch watcher count for ${network}: ${error}`,
        {
          message: error instanceof Error ? error.message : '',
          stack: error instanceof Error ? error.stack : undefined,
        },
      );
      throw error;
    }
  };

  /**
   * Upsert watcher count record for a network
   *
   * @param network - Network identifier
   * @param count - Watcher count
   * @returns Promise resolving to upsert result
   */
  upsertWatcherCount = async (network: string, count: number) => {
    this.logger.debug(`Upserting watcher count for ${network}: ${count}`);
    try {
      const result = await this.watcherRepo.upsert({ network, count }, [
        'network',
      ]);
      this.logger.debug(`Watcher count upserted for ${network}`);
      return result;
    } catch (error) {
      this.logger.debug(
        `Failed to upsert watcher count for ${network}: ${error}`,
        {
          message: error instanceof Error ? error.message : '',
          stack: error instanceof Error ? error.stack : undefined,
        },
      );
      throw error;
    }
  };
}
