import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';

import { METRIC_KEYS } from '../constants';
import { EventCountEntity } from '../entities';
import { MetricAction } from './MetricAction';

export class EventCountMetricAction {
  private readonly eventTriggerRepo: Repository<EventTriggerEntity>;
  private readonly eventCountRepo: Repository<EventCountEntity>;
  private readonly metricAction: MetricAction;
  readonly logger: AbstractLogger;

  constructor(dataSource: DataSource, logger?: AbstractLogger) {
    this.eventTriggerRepo = dataSource.getRepository(EventTriggerEntity);
    this.eventCountRepo = dataSource.getRepository(EventCountEntity);
    this.metricAction = new MetricAction(dataSource, logger);
    this.logger = logger ?? new DummyLogger();
  }

  /**
   * Calculate event counts per (status, fromChain, toChain)
   * - Only Success and Fraud are counted
   * - Updates lastProcessedHeight
   * - Sums all counts and writes total to MetricEntity
   */
  calculateAndStoreEventCounts = async (): Promise<void> => {
    const timestamp = Math.floor(Date.now() / 1000);
    this.logger.debug(`Calculating event counts at timestamp: [${timestamp}]`);

    const lastProcessed = await this.eventCountRepo
      .createQueryBuilder('ec')
      .select('MAX(ec.lastProcessedHeight)', 'lastHeight')
      .getRawOne<{ lastHeight: number }>();
    const lastHeight = lastProcessed?.lastHeight ?? 0;

    this.logger.debug(`Last processed height: [${lastHeight}]`);

    const aggregated = await this.eventTriggerRepo
      .createQueryBuilder('et')
      .select('et.result', 'status')
      .addSelect('et.fromChain', 'fromChain')
      .addSelect('et.toChain', 'toChain')
      .addSelect('COUNT(et.fromAddress)', 'eventCount')
      .addSelect('MAX(et.height)', 'maxHeight')
      .where('et.height > :lastHeight', { lastHeight })
      .andWhere('et.result IN (:...statuses)', {
        statuses: ['Success', 'Fraud'],
      })
      .groupBy('et.result')
      .addGroupBy('et.fromChain')
      .addGroupBy('et.toChain')
      .getRawMany<{
        status: string;
        fromChain: string;
        toChain: string;
        eventCount: string;
        maxHeight: number;
      }>();

    if (!aggregated.length) {
      this.logger.debug('No new events to process.');
      return;
    }

    let totalCount = 0;

    for (const row of aggregated) {
      const count = Number(row.eventCount);
      totalCount += count;
      const lastEventCount = await this.eventCountRepo.findOne({
        where: {
          status: row.status,
          fromChain: row.fromChain,
          toChain: row.toChain,
        },
      });

      const newCount = lastEventCount
        ? lastEventCount.eventCount + count
        : count;

      await this.eventCountRepo.upsert(
        {
          status: row.status,
          fromChain: row.fromChain,
          toChain: row.toChain,
          eventCount: newCount,
          lastProcessedHeight: row.maxHeight,
        },
        ['status', 'fromChain', 'toChain'],
      );
    }

    const totalExistingEvent = await this.metricAction.getMetricByKey(
      METRIC_KEYS.EVENT_COUNT_TOTAL,
    );
    const existingValue = totalExistingEvent
      ? Number(totalExistingEvent.value)
      : 0;
    await this.metricAction.upsertMetric(
      METRIC_KEYS.EVENT_COUNT_TOTAL,
      (existingValue + totalCount).toString(),
      timestamp,
    );

    this.logger.debug(
      `Processed ${aggregated.length} event groups, total events: ${totalCount}`,
    );
  };
}
