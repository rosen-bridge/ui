import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';

import { EventCountEntity } from '../entities';

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
    return this.eventCountRepo
      .find({
        select: ['lastProcessedHeight'],
        order: { lastProcessedHeight: 'DESC' },
        take: 1,
      })
      .then((res) => {
        const height = res[0] ? res[0].lastProcessedHeight : 0;
        this.logger.debug(`Last processed height: ${height}`);
        return height;
      })
      .catch((error) => {
        this.logger.debug(`Failed to fetch last processed height: ${error}`, {
          message: error instanceof Error ? error.message : '',
          stack: error instanceof Error ? error.stack : undefined,
        });
        throw error;
      });
  };

  /**
   * Get aggregated event counts since last processed height
   *
   * @param lastHeight - The last processed height to start from
   * @returns Promise resolving to aggregated event data
   */
  getAggregatedEvents = async (lastHeight: number) => {
    this.logger.debug(`Fetching aggregated events since height: ${lastHeight}`);
    try {
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
        .getRawMany<{
          status: string;
          fromChain: string;
          toChain: string;
          eventCount: number;
          maxHeight: number;
        }>();

      this.logger.debug(`Found ${aggregated.length} aggregated event groups`);
      return aggregated;
    } catch (error) {
      this.logger.debug(`Failed to fetch aggregated events: ${error}`, {
        message: error instanceof Error ? error.message : '',
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  };

  /**
   * Get existing event count for a specific group
   *
   * @param status - Event status (successful/fraud)
   * @param fromChain - Source chain
   * @param toChain - Target chain
   * @returns Promise resolving to existing EventCountEntity or null
   */
  getExistingEventCount = async (
    status: string,
    fromChain: string,
    toChain: string,
  ) => {
    this.logger.debug(
      `Fetching existing event count for ${status}, ${fromChain} -> ${toChain}`,
    );
    try {
      const existing = await this.eventCountRepo.findOne({
        where: { status, fromChain, toChain },
      });
      return existing;
    } catch (error) {
      this.logger.debug(`Failed to fetch existing event count: ${error}`, {
        message: error instanceof Error ? error.message : '',
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  };

  /**
   * Upsert event count data for a specific group
   *
   * @param status - Event status (successful/fraud)
   * @param fromChain - Source chain
   * @param toChain - Target chain
   * @param eventCount - New event count
   * @param maxHeight - Maximum processed height
   * @returns Promise resolving to upsert result
   */
  upsertEventCount = async (
    status: string,
    fromChain: string,
    toChain: string,
    eventCount: number,
    maxHeight: number,
  ) => {
    this.logger.debug(
      `Upserting event count for ${status}, ${fromChain} -> ${toChain}: ${eventCount}`,
    );
    try {
      const result = await this.eventCountRepo.upsert(
        {
          status,
          fromChain,
          toChain,
          eventCount,
          lastProcessedHeight: maxHeight,
        },
        ['status', 'fromChain', 'toChain'],
      );
      this.logger.debug('Event count upserted successfully');
      return result;
    } catch (error) {
      this.logger.debug(`Failed to upsert event count: ${error}`, {
        message: error instanceof Error ? error.message : '',
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  };
}
