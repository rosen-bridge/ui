import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import {
  Dependency,
  ServiceAction,
  ServiceStatus,
} from '@rosen-bridge/service-manager';
import { lockedAssetsMetric } from '@rosen-ui/rosen-statistics';

import { configs } from '../configs';
import {
  AbstractAssetAggregatorServicce,
  AbstractDBService,
  AbstractLockedAssetsMetricService,
} from './abstracts';

export class LockedAssetsMetricService extends AbstractLockedAssetsMetricService {
  name = AbstractLockedAssetsMetricService.name;
  private dataSource: DataSource;
  protected dependencies: Dependency[] = [
    {
      serviceName: AbstractDBService.name,
      allowedStatuses: [
        ServiceStatus.running,
        ServiceStatus.started,
        ServiceStatus.dormant,
      ],
      action: ServiceAction.assemble,
    },
    {
      serviceName: AbstractAssetAggregatorServicce.name,
      allowedStatuses: [ServiceStatus.running],
      action: ServiceAction.start,
    },
  ];

  protected constructor(logger?: AbstractLogger) {
    super(logger);
  }

  protected assemble = async (): Promise<boolean> => {
    this.dataSource = AbstractDBService.getInstance().getDataSource();
    this.setStatus(ServiceStatus.dormant);
    return true;
  };

  /**
   * Initializes the singleton instance of locked assets metric service
   *
   * @static
   * @param {AbstractLogger} [logger] - Optional logger instance
   * @memberof LockedAssetsMetricService
   */
  static init = (logger?: AbstractLogger) => {
    if (AbstractLockedAssetsMetricService.instance != undefined) {
      return;
    }
    AbstractLockedAssetsMetricService.instance = new LockedAssetsMetricService(
      logger,
    );
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
        this.dataSource,
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
