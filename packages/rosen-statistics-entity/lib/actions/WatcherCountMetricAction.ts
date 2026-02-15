import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';

import { WatcherCountEntity } from '../entities';
import { WatcherCountType } from '../types';

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
    const record = await this.watcherRepo.findOne({
      where: { network },
    });
    return record;
  };

  /**
   * Upsert watcher counts record for a list of networks
   *
   * @param network - Network identifier
   * @param count - Watcher count
   * @param watchersCounts
   * @returns Promise resolving to upsert result
   */
  upsertWatcherCount = async (watchersCounts: WatcherCountType[]) => {
    this.logger.debug('Upserting watchers counts...');
    await this.watcherRepo.upsert(watchersCounts, ['network']);
    this.logger.debug('Watchers counts upserted');
  };
}
