import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';

import { METRIC_KEYS } from '../constants';
import { EventCountEntity, MetricEntity } from '../entities';
import { AggregatedEvents, EventCountStatus } from '../types';

export class EventCountMetricAction {
  private readonly eventTriggerRepo: Repository<EventTriggerEntity>;
  private readonly eventCountRepo: Repository<EventCountEntity>;
  readonly logger: AbstractLogger;

  constructor(dataSource: DataSource, logger?: AbstractLogger) {
    this.eventTriggerRepo = dataSource.getRepository(EventTriggerEntity);
    this.eventCountRepo = dataSource.getRepository(EventCountEntity);
    this.logger = logger ?? new DummyLogger();
    this.logger.debug('EventCountMetricAction initialized');
  }

  /**
   * Get the last processed height from EventCountEntity records
   *
   * @returns Promise resolving to the last processed height, or 0 if no records exist
   */
  getLastProcessedHeight = async (): Promise<number> => {
    this.logger.debug('Fetching last processed height');
    const res = await this.eventCountRepo.find({
      select: ['lastProcessedHeight'],
      order: { lastProcessedHeight: 'DESC' },
      take: 1,
    });
    const height = res[0] ? res[0].lastProcessedHeight : 0;
    this.logger.debug(`Last processed height: ${height}`);
    return height;
  };

  /**
   * Get aggregated event counts since last processed height
   *
   * @param lastHeight - The last processed height to start from
   * @returns Promise resolving to aggregated event data
   */
  getAggregatedEvents = async (lastHeight: number) => {
    this.logger.debug(`Fetching aggregated events since height: ${lastHeight}`);
    const aggregated = await this.eventTriggerRepo
      .createQueryBuilder('et')
      .select('et.result', 'status')
      .addSelect('et.fromChain', 'fromChain')
      .addSelect('et.toChain', 'toChain')
      .addSelect('COUNT(et.fromAddress)', 'eventCount')
      .addSelect('MAX(et.spendHeight)', 'maxHeight')
      .where('et.spendHeight > :lastHeight', { lastHeight })
      .andWhere('et.result IN (:...statuses)', {
        statuses: ['successful', 'fraud'],
      })
      .groupBy('et.result')
      .addGroupBy('et.fromChain')
      .addGroupBy('et.toChain')
      .getRawMany<AggregatedEvents>();

    this.logger.debug(`Found ${aggregated.length} aggregated event groups`);
    return aggregated;
  };

  /**
   * Get existing event count for a specific group
   *
   * @param status - EventCountStatus (successful/fraud)
   * @param fromChain - Source chain
   * @param toChain - Target chain
   * @returns Promise resolving to existing event count, or 0 if no record exists
   */
  getExistingEventCount = async (
    status: EventCountStatus,
    fromChain: string,
    toChain: string,
  ) => {
    this.logger.debug(
      `Fetching existing event count for ${status}, ${fromChain} -> ${toChain}`,
    );
    const existing = await this.eventCountRepo.findOne({
      where: { status, fromChain, toChain },
    });
    return existing ? existing.eventCount : 0;
  };

  /**
   * Upserts the aggregated events count and total count into the database.
   * @param  aggregatedEvents - An array of aggregated events to upsert.
   * @param  totalCount - The total count of events to be updated.
   * @returns A Promise that resolves when the upsert is completed.
   */
  upsertEventsCount = async (
    aggregatedEvents: AggregatedEvents[],
    totalCount: number,
  ): Promise<void> => {
    const queryRunner =
      this.eventCountRepo.manager.connection.createQueryRunner();
    try {
      await queryRunner.startTransaction();

      const eventCountRepo =
        queryRunner.manager.getRepository(EventCountEntity);
      const metricRepo = queryRunner.manager.getRepository(MetricEntity);

      for (const row of aggregatedEvents) {
        await eventCountRepo.upsert(
          {
            status: row.status,
            fromChain: row.fromChain,
            toChain: row.toChain,
            eventCount: row.eventCount,
            lastProcessedHeight: row.maxHeight,
          },
          ['status', 'fromChain', 'toChain'],
        );
      }

      await metricRepo.upsert(
        {
          key: METRIC_KEYS.EVENT_COUNT_TOTAL,
          value: totalCount.toString(),
          updatedAt: Math.floor(Date.now() / 1000),
        },
        ['key'],
      );

      await queryRunner.commitTransaction();
      this.logger.debug('Transaction committed successfully');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.debug(`Transaction rolled back due to error: ${error}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  };
}
