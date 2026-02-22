import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';

import { METRIC_KEYS } from '../constants';
import { MetricEntity, UserEventEntity } from '../entities';
import { AggregatedUserEvents } from '../types';

export class UserEventMetricAction {
  private readonly eventTriggerRepo: Repository<EventTriggerEntity>;
  private readonly userEventRepo: Repository<UserEventEntity>;
  private readonly logger: AbstractLogger;

  constructor(dataSource: DataSource, logger?: AbstractLogger) {
    this.eventTriggerRepo = dataSource.getRepository(EventTriggerEntity);
    this.userEventRepo = dataSource.getRepository(UserEventEntity);
    this.logger = logger ?? new DummyLogger();
    this.logger.debug('UserEventMetricAction initialized');
  }

  /**
   * Get the last processed height from UserEventEntity records
   *
   * @returns Promise resolving to the last processed height, or 0 if no records exist
   */
  getLastProcessedHeight = async (): Promise<number> => {
    this.logger.debug('Fetching last processed height');
    const res = await this.userEventRepo.find({
      select: ['lastProcessedHeight'],
      order: { lastProcessedHeight: 'DESC' },
      take: 1,
    });
    const height = res[0] ? res[0].lastProcessedHeight : 0;
    this.logger.debug(`Last processed height: ${height}`);
    return height;
  };

  /**
   * Get aggregated user event counts since last processed height
   *
   * @param lastProcessedHeight - The last processed block height (exclusive)
   * @param untilTimestamp - Upper bound timestamp (exclusive)
   * @returns - Promise resolving to aggregated user event data
   */
  getAggregatedUsersEvents = async (
    lastProcessedHeight: number,
    untilProcessedHeight: number,
  ): Promise<AggregatedUserEvents[]> => {
    this.logger.debug(
      `Fetching aggregated events after height ${lastProcessedHeight} until height ${untilProcessedHeight}`,
    );

    const aggregated = await this.eventTriggerRepo
      .createQueryBuilder('et')
      .select('et.fromAddress', 'fromAddress')
      .addSelect('et.toAddress', 'toAddress')
      .addSelect('et.fromChain', 'fromChain')
      .addSelect('et.toChain', 'toChain')
      .addSelect('COUNT(*)', 'count')
      .addSelect('MAX(et.spendHeight)', 'lastProcessedHeight')
      .where('et.result = :status', { status: 'successful' })
      .andWhere('et.spendHeight > :start AND et.spendHeight < :end', {
        start: lastProcessedHeight,
        end: untilProcessedHeight,
      })
      .groupBy('et.fromAddress')
      .addGroupBy('et.toAddress')
      .addGroupBy('et.fromChain')
      .addGroupBy('toChain')
      .getRawMany<AggregatedUserEvents>();

    this.logger.debug(`Found ${aggregated.length} aggregated events`);
    return aggregated;
  };

  /**
   * Get existing UserEventEntity for a specific from/to address pair
   *
   * @param fromAddress - Source address
   * @param fromChain  - Source chain
   * @param toAddress - Target address
   * @param toAddress - Target chain
   * @returns Promise resolving to existing user event count, or 0 if no record exists
   */
  getExistingUserEvent = async (
    fromAddress: string,
    fromChain: string,
    toAddress: string,
    toChain: string,
  ) => {
    this.logger.debug(
      `Fetching existing user event: ${fromAddress}/${fromChain} -> ${toAddress}/${toChain}`,
    );
    const existing = await this.userEventRepo.findOne({
      where: {
        fromAddress,
        fromChain,
        toAddress,
        toChain,
      },
    });
    return existing ? existing.count : 0;
  };

  /**
   * Upserts the aggregated users events count and total count into the database.
   * @param  aggregatedUsersEvents - An array of aggregated users events to upsert.
   * @returns A Promise that resolves when the upsert is completed.
   */
  upsertUserEventsCount = async (
    aggregatedUsersEvents: AggregatedUserEvents[],
  ): Promise<void> => {
    const queryRunner =
      this.userEventRepo.manager.connection.createQueryRunner();
    try {
      await queryRunner.startTransaction();

      const userEventCountRepo =
        queryRunner.manager.getRepository(UserEventEntity);
      const metricRepo = queryRunner.manager.getRepository(MetricEntity);

      await userEventCountRepo.upsert(aggregatedUsersEvents, [
        'fromAddress',
        'toAddress',
        'fromChain',
        'toChain',
      ]);

      const totalCount = await userEventCountRepo.count();

      await metricRepo.upsert(
        {
          key: METRIC_KEYS.USER_COUNT_TOTAL,
          value: totalCount.toString(),
          updatedAt: Math.floor(Date.now() / 1000),
        },
        ['key'],
      );

      await queryRunner.commitTransaction();
      this.logger.debug('Transaction committed successfully');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Transaction rolled back due to error: ${error}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  };
}
