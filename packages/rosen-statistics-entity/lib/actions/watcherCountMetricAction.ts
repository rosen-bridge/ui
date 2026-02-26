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
