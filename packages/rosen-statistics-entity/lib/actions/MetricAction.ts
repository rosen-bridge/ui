import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';

import { MetricKey } from '../constants';
import { MetricEntity } from '../entities';

export class MetricAction {
  private readonly repository: Repository<MetricEntity>;
  readonly logger: AbstractLogger;

  constructor(dataSource: DataSource, logger?: AbstractLogger) {
    this.repository = dataSource.getRepository(MetricEntity);
    this.logger = logger ?? new DummyLogger();
  }

  /**
   * Insert or update a metric record by key.
   *
   * If a record with the given key already exists,
   * its value and updatedAt fields will be updated.
   *
   * @param key       unique metric identifier
   * @param value     metric value
   * @param timestamp unix timestamp (seconds).
   *                  If not provided, current time is used.
   */
  upsertMetric = async (
    key: MetricKey,
    value: string,
    timestamp?: number,
  ): Promise<void> => {
    const updatedAt = timestamp ?? Math.floor(Date.now() / 1000);

    this.logger.debug(
      `Upserting metric [${key}] with value [${value}] at [${updatedAt}]`,
    );

    await this.repository.upsert(
      {
        key,
        value,
        updatedAt,
      },
      ['key'],
    );
  };

  /**
   * Fetch a metric record by its key.
   *
   * @param key unique metric identifier
   * @returns MetricEntity if found, otherwise null
   */
  getMetricByKey = async (key: MetricKey): Promise<MetricEntity | null> => {
    this.logger.debug(`Fetching metric with key [${key}]`);

    return this.repository.findOne({
      where: { key },
    });
  };
}
