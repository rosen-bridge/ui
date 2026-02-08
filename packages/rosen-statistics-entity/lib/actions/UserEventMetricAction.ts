import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';

import { UserEventEntity } from '../entities';

export class UserEventMetricAction {
  private readonly eventTriggerRepo: Repository<EventTriggerEntity>;
  private readonly userEventRepo: Repository<UserEventEntity>;
  readonly logger: AbstractLogger;

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
    return this.userEventRepo
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
   * Get aggregated user event counts since last processed height
   *
   * @param lastHeight - The last processed height to start from
   * @returns - Promise resolving to aggregated user event data
   */
  getAggregatedEvents = async (lastHeight: number) => {
    this.logger.debug(`Fetching aggregated events since height: ${lastHeight}`);
    try {
      const aggregated = await this.eventTriggerRepo
        .createQueryBuilder('et')
        .addSelect('et.fromAddress', 'fromAddress')
        .addSelect('et.toAddress', 'toAddress')
        .addSelect('COUNT(*)', 'userCount')
        .addSelect('MAX(et.spendHeight)', 'maxHeight')
        .where('et.spendHeight > :lastHeight', { lastHeight })
        .andWhere('et.result = :status', { status: 'successful' })
        .addGroupBy('et.fromAddress')
        .addGroupBy('et.toAddress')
        .getRawMany<{
          fromAddress: string;
          toAddress: string;
          userCount: number;
          maxHeight: number;
        }>();

      this.logger.debug(`Found ${aggregated.length} aggregated events`);
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
   * Get existing UserEventEntity for a specific from/to address pair
   *
   * @param fromAddress - Source address
   * @param toAddress - Target address
   * @returns Promise resolving to existing UserEventEntity or null
   */
  getExistingUserEvent = async (fromAddress: string, toAddress: string) => {
    this.logger.debug(
      `Fetching existing user event for  ${fromAddress} -> ${toAddress}`,
    );
    try {
      const existing = await this.userEventRepo.findOne({
        where: { fromAddress, toAddress },
      });
      return existing;
    } catch (error) {
      this.logger.debug(`Failed to fetch existing user event: ${error}`, {
        message: error instanceof Error ? error.message : '',
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  };

  /**
   * Upsert user event count data for a specific group
   *
   * @param fromAddress - Source address
   * @param toAddress - Target address
   * @param count - New user event count
   * @param maxHeight - Maximum processed height
   * @returns Promise resolving to upsert result
   */
  upsertUserEventCount = async (
    fromAddress: string,
    toAddress: string,
    count: number,
    maxHeight: number,
  ) => {
    this.logger.debug(
      `Upserting user event count for ${fromAddress} -> ${toAddress}: ${count}`,
    );
    try {
      const result = await this.userEventRepo.upsert(
        {
          fromAddress,
          toAddress,
          count,
          lastProcessedHeight: maxHeight,
        },
        ['fromAddress', 'toAddress'],
      );
      this.logger.debug('User event count upserted successfully');
      return result;
    } catch (error) {
      this.logger.debug(`Failed to upsert user event count: ${error}`, {
        message: error instanceof Error ? error.message : '',
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  };
}
