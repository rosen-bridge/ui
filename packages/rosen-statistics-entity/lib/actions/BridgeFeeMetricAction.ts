import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { BlockEntity } from '@rosen-bridge/abstract-scanner';
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';

import { BridgeFeeEntity } from '../entities';

export class BridgeFeeMetricAction {
  private readonly eventTriggerRepo: Repository<EventTriggerEntity>;
  private readonly blockRepo: Repository<BlockEntity>;
  private readonly bridgeFeeRepo: Repository<BridgeFeeEntity>;
  readonly logger: AbstractLogger;

  /**
   * Constructor for BridgeFeeMetricAction
   *
   * @param dataSource - TypeORM DataSource instance for database operations
   * @param logger - Optional logger instance; uses DummyLogger if not provided
   */
  constructor(dataSource: DataSource, logger?: AbstractLogger) {
    this.eventTriggerRepo = dataSource.getRepository(EventTriggerEntity);
    this.blockRepo = dataSource.getRepository(BlockEntity);
    this.bridgeFeeRepo = dataSource.getRepository(BridgeFeeEntity);
    this.logger = logger ?? new DummyLogger();
    this.logger.debug('BridgeFeeMetricAction initialized');
  }

  /**
   * Get the last processed height from BridgeFeeEntity records
   *
   * @returns Promise resolving to the last processed height, or undefined if no records exist
   */
  getLastProcessedHeight = async (): Promise<number | undefined> => {
    this.logger.debug('Fetching last processed height');
    return this.bridgeFeeRepo
      .find({
        select: ['lastProcessedHeight'],
        order: { lastProcessedHeight: 'DESC' },
        take: 1,
      })
      .then((res) => {
        const height = res[0] ? res[0].lastProcessedHeight : undefined;
        this.logger.debug(`Last processed height: ${height ?? 'not found'}`);
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
   * Get the timestamp of the first event in the database
   *
   * @returns Promise resolving to the first event timestamp, or undefined if no events exist
   */
  getFirstEventTimestamp = async (): Promise<number | undefined> => {
    this.logger.debug('Fetching first event timestamp');
    try {
      const firstEvent = await this.eventTriggerRepo
        .createQueryBuilder('et')
        .select('b.timestamp', 'timestamp')
        .leftJoin(
          BlockEntity,
          'b',
          'b.hash = et.spendBlock AND b.scanner = :scanner',
          { scanner: 'ergo' },
        )
        .orderBy('b.timestamp', 'ASC')
        .getRawOne<{ timestamp: number }>();

      const timestamp = firstEvent?.timestamp;
      this.logger.debug(
        `First event timestamp: ${timestamp ? timestamp : 'not found'}`,
      );
      return timestamp;
    } catch (error) {
      this.logger.debug(`Failed to fetch first event timestamp: ${error}`, {
        message: error instanceof Error ? error.message : '',
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  };

  /**
   * Get block information by height for the Ergo scanner
   *
   * @param height - Block height to query
   * @returns Promise resolving to BlockEntity or null if not found
   */
  getBlockByHeight = async (height: number) => {
    this.logger.debug(`Fetching block at height: ${height}`);
    try {
      const block = await this.blockRepo.findOne({
        where: { height, scanner: 'ergo' },
      });
      this.logger.debug(
        block
          ? `Block found at height ${height}`
          : `No block found at height ${height}`,
      );
      return block;
    } catch (error) {
      this.logger.debug(`Failed to fetch block at height ${height}: ${error}`, {
        message: error instanceof Error ? error.message : '',
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  };

  /**
   * Get successful events within a specified timestamp range with related block data
   *
   * @param startTs - Start timestamp (inclusive)
   * @param endTs - End timestamp (exclusive)
   * @returns Promise resolving to an array of events with bridge fee data and timestamps
   */
  getEventsInRange = async (startTs: number, endTs: number) => {
    this.logger.debug(
      `Fetching events in timestamp range: ${startTs} to ${endTs}`,
    );
    try {
      const events = await this.eventTriggerRepo
        .createQueryBuilder('et')
        .leftJoin(
          BlockEntity,
          'be',
          `be.hash = et.spendBlock and be.scanner = 'ergo'`,
        )
        .leftJoin(
          BlockEntity,
          'be2',
          `be2.height = et.sourceChainHeight and be2.scanner = 'ergo'`,
        )
        .select([
          'et.fromChain as fromChain',
          'et.bridgeFee as bridgeFee',
          'et.sourceChainTokenId as tokenId',
          'et.sourceChainHeight as eventHeight',
          'be.timestamp as timestamp',
          'be.height as height',
          'be.day as day',
          'be.month as month',
          'be.year as year',
          'be2.timestamp as eventTimestamp',
        ])
        .where('et.result = :status', { status: 'successful' })
        .andWhere('be.timestamp >= :start AND be.timestamp < :end', {
          start: startTs,
          end: endTs,
        })
        .getRawMany<{
          fromChain: string;
          bridgeFee: string;
          tokenId: string;
          eventHeight: number;
          timestamp: number;
          height: number;
          day: number;
          month: number;
          year: number;
          eventTimestamp: number;
        }>();

      this.logger.debug(`Found ${events.length} events in specified range`);
      return events;
    } catch (error) {
      this.logger.debug(`Failed to fetch events in range ${startTs}-${endTs}`, {
        message: error instanceof Error ? error.message : '',
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  };

  /**
   * Upsert bridge fee data into BridgeFeeEntity
   * Uses composite key: fromChain + day + month + year for uniqueness
   *
   * @param data - Partial BridgeFeeEntity data to upsert
   * @returns Promise resolving to the upsert result
   */
  upsertBridgeFee = async (data: Partial<BridgeFeeEntity>) => {
    this.logger.debug(
      `Upserting bridge fee data for chain: ${data.fromChain}, date: ${data.year}-${data.month}-${data.day}`,
    );
    try {
      const result = await this.bridgeFeeRepo.upsert(data, [
        'fromChain',
        'day',
        'month',
        'year',
      ]);
      this.logger.debug('Bridge fee data upserted successfully');
      return result;
    } catch (error) {
      this.logger.debug(`Failed to upsert bridge fee data: ${error}`, {
        message: error instanceof Error ? error.message : '',
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  };
}
