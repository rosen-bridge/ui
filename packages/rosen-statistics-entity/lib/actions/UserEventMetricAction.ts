import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { BlockEntity } from '@rosen-bridge/abstract-scanner';
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
   * @param untilTimestamp - Upper bound timestamp (exclusive, in seconds)
   * @returns - Promise resolving to aggregated user event data
   */
  getAggregatedEvents = async (
    lastProcessedHeight: number,
    untilTimestamp: number,
  ): Promise<AggregatedUserEvents[]> => {
    this.logger.debug(
      `Fetching aggregated events after height ${lastProcessedHeight} until timestamp ${untilTimestamp}`,
    );

    const aggregated = await this.eventTriggerRepo
      .createQueryBuilder('et')
      .leftJoin(
        BlockEntity,
        'be',
        `be.hash = et.spendBlock AND be.scanner = 'ergo'`,
      )
      .select('et.fromAddress', 'fromAddress')
      .addSelect('et.toAddress', 'toAddress')
      .addSelect('COUNT(*)', 'count')
      .addSelect('MAX(et.spendHeight)', 'lastProcessedHeight')
      .where('et.spendHeight > :lastProcessedHeight', { lastProcessedHeight })
      .andWhere('et.result = :status', { status: 'successful' })
      .andWhere('be.timestamp < :untilTimestamp', { untilTimestamp })
      .groupBy('et.fromAddress')
      .addGroupBy('et.toAddress')
      .getRawMany<AggregatedUserEvents>();

    this.logger.debug(`Found ${aggregated.length} aggregated events`);
    return aggregated;
  };

  /**
   * Get existing UserEventEntity for a specific from/to address pair
   *
   * @param fromAddress - Source address
   * @param toAddress - Target address
   * @returns Promise resolving to existing user event count, or 0 if no record exists
   */
  getExistingUserEvent = async (fromAddress: string, toAddress: string) => {
    this.logger.debug(
      `Fetching existing user event for  ${fromAddress} -> ${toAddress}`,
    );
    const existing = await this.userEventRepo.findOne({
      where: { fromAddress, toAddress },
    });
    return existing ? existing.count : 0;
  };

  /**
   * Upserts the aggregated users events count and total count into the database.
   * @param  aggregatedUsersEvents - An array of aggregated users events to upsert.
   * @param  totalCount - The total count of events to be updated.
   * @returns A Promise that resolves when the upsert is completed.
   */
  upsertEventsCount = async (
    aggregatedUsersEvents: AggregatedUserEvents[],
    totalCount: number,
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
      ]);

      await metricRepo.upsert(
        {
          key: METRIC_KEYS.USER_EVENT_TOTAL,
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
