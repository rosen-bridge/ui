import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';

import { METRIC_KEYS } from '../constants';
import { UserEventEntity } from '../entities';
import { MetricAction } from './MetricAction';

export class UserEventMetricAction {
  private readonly eventTriggerRepo: Repository<EventTriggerEntity>;
  private readonly userEventRepo: Repository<UserEventEntity>;
  private readonly metricAction: MetricAction;
  readonly logger: AbstractLogger;

  constructor(dataSource: DataSource, logger?: AbstractLogger) {
    this.eventTriggerRepo = dataSource.getRepository(EventTriggerEntity);
    this.userEventRepo = dataSource.getRepository(UserEventEntity);
    this.metricAction = new MetricAction(dataSource, logger);
    this.logger = logger ?? new DummyLogger();
  }

  /**
   * Calculate user counts per (fromAddress, toAddress)
   * - Only Success are counted
   * - Updates lastProcessedHeight
   * - Sums all counts and writes total to MetricEntity
   */
  calculateAndStoreUserCounts = async (): Promise<void> => {
    const timestamp = Math.floor(Date.now() / 1000);
    this.logger.debug(`Calculating user counts at timestamp: [${timestamp}]`);

    const lastProcessed = await this.userEventRepo
      .createQueryBuilder('ue')
      .select('MAX(ue.lastProcessedHeight)', 'lastHeight')
      .getRawOne<{ lastHeight: number }>();
    const lastHeight = lastProcessed?.lastHeight ?? 0;

    this.logger.debug(`Last processed height: [${lastHeight}]`);

    const aggregated = await this.eventTriggerRepo
      .createQueryBuilder('et')
      .addSelect('et.fromAddress', 'fromAddress')
      .addSelect('et.toAddress', 'toAddress')
      .addSelect('COUNT(*)', 'eventCount')
      .addSelect('MAX(et.height)', 'maxHeight')
      .where('et.height > :lastHeight', { lastHeight })
      .andWhere('et.result = :status', { status: 'Success' })
      .addGroupBy('et.fromAddress')
      .addGroupBy('et.toAddress')
      .getRawMany<{
        fromAddress: string;
        toAddress: string;
        eventCount: string;
        maxHeight: number;
      }>();

    if (!aggregated.length) {
      this.logger.debug('No new events to process.');
      return;
    }

    for (const row of aggregated) {
      const count = Number(row.eventCount);
      const lastEventCount = await this.userEventRepo.findOne({
        where: {
          fromAddress: row.fromAddress,
          toAddress: row.toAddress,
        },
      });

      const newCount = lastEventCount ? lastEventCount.count + count : count;
      await this.userEventRepo.upsert(
        {
          fromAddress: row.fromAddress,
          toAddress: row.toAddress,
          count: newCount,
          lastProcessedHeight: row.maxHeight,
        },
        ['fromAddress', 'toAddress'],
      );
    }

    const numberOfUser = await this.userEventRepo.count();
    await this.metricAction.upsertMetric(
      METRIC_KEYS.USER_EVENT_TOTAL,
      numberOfUser.toString(),
      timestamp,
    );

    this.logger.debug(`User count metric updated: [${numberOfUser}]`);
  };
}
