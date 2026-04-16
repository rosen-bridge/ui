import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { BlockEntity } from '@rosen-bridge/abstract-scanner';
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';
import { TokenEntity } from '@rosen-ui/asset-calculator';

import { METRIC_KEYS } from '../constants';
import { BridgeFeeEntity, MetricEntity } from '../entities';
import { BridgeEventData, BridgeMetricRecord } from '../types';

export class BridgeMetricsAction {
  private readonly eventTriggerRepo: Repository<EventTriggerEntity>;
  private readonly bridgeFeeRepo: Repository<BridgeFeeEntity>;
  readonly logger: AbstractLogger;

  /**
   * Constructor for BridgeMetricsAction
   *
   * @param dataSource - TypeORM DataSource instance for database operations
   * @param logger - Optional logger instance; uses DummyLogger if not provided
   */
  constructor(dataSource: DataSource, logger?: AbstractLogger) {
    this.eventTriggerRepo = dataSource.getRepository(EventTriggerEntity);
    this.bridgeFeeRepo = dataSource.getRepository(BridgeFeeEntity);
    this.logger = logger ?? new DummyLogger();
    this.logger.debug('BridgeMetricsAction initialized');
  }

  /**
   * Get the last processed record from BridgeFeeEntity records
   *
   * @returns Promise resolving to the last processed record, or undefined if no records exist
   */
  getLastProcessedRecord = async (): Promise<BridgeFeeEntity | undefined> => {
    this.logger.debug('Fetching last processed record');
    const res = await this.bridgeFeeRepo.find({
      select: [
        'fromChain',
        'amount',
        'day',
        'week',
        'month',
        'year',
        'lastProcessedHeight',
      ],
      order: { lastProcessedHeight: 'DESC' },
      take: 1,
    });
    const height = res[0] ? res[0].lastProcessedHeight : 0;
    const lastProcessedRecord = res[0];
    this.logger.debug(`Last processed record at height: ${height}`);
    return lastProcessedRecord;
  };

  /**
   * Get the timestamp of the first event in the database
   *
   * @returns Promise resolving to the first event timestamp, or undefined if no events exist
   */
  getFirstEventTimestamp = async (): Promise<number | undefined> => {
    this.logger.debug('Fetching first event timestamp');
    const firstEvent = await this.eventTriggerRepo
      .createQueryBuilder('et')
      .select('b.timestamp', 'timestamp')
      .addSelect('b.id', 'id')
      .innerJoin(
        BlockEntity,
        'b',
        'b.hash = et.spendBlock AND b.scanner = :scanner',
        { scanner: 'ergo' },
      )
      .orderBy('b.timestamp', 'ASC')
      .getRawOne<{ timestamp: number; id: number }>();

    const timestamp = firstEvent?.timestamp;
    const id = firstEvent?.id;
    if (timestamp && id) {
      this.logger.debug(
        `First event found - ID: ${id}, Timestamp: ${timestamp}`,
      );
    } else {
      this.logger.debug(
        'No events found - first event timestamp is not available',
      );
    }
    return timestamp;
  };

  /**
   * Get successful events within a specified timestamp range with related block data
   *
   * @param startTs - Start timestamp (inclusive)
   * @param endTs - End timestamp (exclusive)
   * @returns Promise resolving to aggregated bridge statistics
   */
  getEventsInRange = async (
    startTs: number,
    endTs: number,
  ): Promise<BridgeEventData[]> => {
    this.logger.debug(
      `Fetching events in timestamp range: ${startTs} to ${endTs}`,
    );
    const events = await this.eventTriggerRepo
      .createQueryBuilder('et')
      .innerJoin(
        BlockEntity,
        'be',
        `be.hash = et.spendBlock and be.scanner = 'ergo'`,
      )
      .innerJoin(TokenEntity, 'te', `te.id = et.sourceChainTokenId`)
      .select([
        'et.fromChain as "fromChain"',
        'et.bridgeFee as "bridgeFee"',
        'et.sourceChainTokenId as "tokenId"',
        'et.sourceChainHeight as "eventHeight"',
        'be.timestamp as "timestamp"',
        'be.height as "height"',
        'be.day as "day"',
        'be.month as "month"',
        'be.year as "year"',
        'te.significantDecimal as "decimal"',
      ])
      .where('et.result = :status', { status: 'successful' })
      .andWhere('be.timestamp >= :start AND be.timestamp < :end', {
        start: startTs,
        end: endTs,
      })
      .getRawMany<BridgeEventData>();

    this.logger.debug(`Found ${events.length} aggregated bridge entries`);
    return events;
  };

  /**
   * Insert the aggregated bridge fees and upsert total count into the database.
   * @param aggregatedBridgeFees - An array of aggregated bridge fees to insert.
   * @param totalCount - The total bridge fees value to be updated.
   * @returns A Promise that resolves when the save is completed.
   */
  saveBridgeFees = async (
    aggregatedBridgeFees: BridgeMetricRecord[],
    totalCount: string,
  ): Promise<void> => {
    const queryRunner =
      this.bridgeFeeRepo.manager.connection.createQueryRunner();
    try {
      await queryRunner.startTransaction();

      const bridgeFeeRepo = queryRunner.manager.getRepository(BridgeFeeEntity);
      const metricRepo = queryRunner.manager.getRepository(MetricEntity);

      await bridgeFeeRepo.insert(aggregatedBridgeFees);

      await metricRepo.upsert(
        {
          key: METRIC_KEYS.TOTAL_BRIDGE_FEES_USD,
          value: totalCount,
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
