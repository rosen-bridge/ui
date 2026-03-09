import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import {
  Dependency,
  PeriodicTaskService,
  ServiceStatus,
} from '@rosen-bridge/service-manager';
import { lockedAssetsMetric } from '@rosen-ui/rosen-statistics';

import { configs } from '../configs';
import { AssetAggregatorService } from './assetAggregator';
import { DBService } from './db';

export class LockedAssetsMetricService extends PeriodicTaskService {
  name = 'LockedAssetsMetricService';
  private static instance: LockedAssetsMetricService;
  readonly dbService: DBService;
  protected dependencies: Dependency[] = [
    {
      serviceName: DBService.name,
      allowedStatuses: [ServiceStatus.running],
    },
    {
      serviceName: AssetAggregatorService.name,
      allowedStatuses: [ServiceStatus.running],
    },
  ];

  private constructor(logger?: AbstractLogger) {
    super(logger);
    this.dbService = DBService.getInstance();
  }

  /**
   * Initializes the singleton instance of locked assets metric service
   *
   * @static
   * @param {AbstractLogger} [logger] - Optional logger instance
   * @memberof LockedAssetsMetricService
   */
  static init = (logger?: AbstractLogger) => {
    if (this.instance != undefined) {
      return;
    }
    this.instance = new LockedAssetsMetricService(logger);
  };

  /**
   * Returns the singleton instance of locked assets metric service
   *
   * @static
   * @return {LockedAssetsMetricService} The singleton instance
   * @memberof LockedAssetsMetricService
   */
  static getInstance = (): LockedAssetsMetricService => {
    if (!this.instance) {
      throw new Error(`${this.name} instance is not initialized yet`);
    }
    return this.instance;
  };

  /**
   * Executes the locked assets calculation logic
   *
   * @private
   * @returns {Promise<void>}
   */
  private lockedAssetsCalculation = async (): Promise<void> => {
    try {
      await lockedAssetsMetric(
        this.dbService.dataSource,
        this.logger.child('lockedAssetsMetric'),
      );

      this.logger.info('Locked assets calculation job completed successfully');
    } catch (error) {
      this.logger.error(`Locked assets calculation job failed: ${error}`);
      if (error instanceof Error && error.stack) {
        this.logger.debug(error.stack);
      }
    }
  };

  /**
   * Pre-start hook to prepare the service
   */
  protected preStart = async (): Promise<void> => {};

  /**
   * Post-stop hook for cleanup
   */
  protected postStop = async (): Promise<void> => {};

  /**
   * Builds a list of asynchronous tasks for locked assets calculation.
   *
   * @returns {Task[]}
   */
  protected getTasks = () => {
    const tasks = [];

    tasks.push({
      fn: async () => {
        try {
          this.logger.info(`Running ${this.name} job`);
          await this.lockedAssetsCalculation();
        } catch (err) {
          this.logger.error(`${this.name} job failed: ${err}`);
          if (err instanceof Error && err.stack) {
            this.logger.debug(err.stack);
          }
        }
      },
      interval: configs.statistics.lockedAssetsMetrics.interval * 1000,
    });
    return tasks;
  };
}
