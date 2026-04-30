import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import {
  Dependency,
  ServiceAction,
  ServiceStatus,
} from '@rosen-bridge/service-manager';
import { userEventMetric } from '@rosen-ui/rosen-statistics';

import { configs } from '../configs';
import { DBService } from './db';
import { AbstractScannerService } from './types/abstractScannerService';
import { AbstractUserEventsMetricService } from './types/abstractUserEventsMetricService';
import { AbstractDBService } from './types/abstrctDb';

export class UserEventsMetricService extends AbstractUserEventsMetricService {
  name = 'UserEventsMetricService';
  readonly dbService: DataSource;
  protected dependencies: Dependency[] = [
    {
      serviceName: AbstractDBService.getInstance().getName(),
      allowedStatuses: [ServiceStatus.running, ServiceStatus.dormant],
      action: ServiceAction.assemble,
    },
    {
      serviceName: AbstractScannerService.getInstance().getName(),
      allowedStatuses: [ServiceStatus.running],
      action: ServiceAction.start,
    },
  ];

  private constructor(logger?: AbstractLogger) {
    super(logger);
    this.dbService = DBService.getInstance().getDataSource();
  }

  protected assemble = async (): Promise<boolean> => {
    this.setStatus(ServiceStatus.dormant);
    return true;
  };

  /**
   * Initializes the singleton instance of UserEventsMetricService
   *
   * @static
   * @param {AbstractLogger} [logger] - Optional logger instance
   * @memberof UserEventsMetricService
   */
  static init = (logger?: AbstractLogger) => {
    if (AbstractUserEventsMetricService.instance != undefined) {
      return;
    }
    AbstractUserEventsMetricService.instance = new UserEventsMetricService(
      logger,
    );
  };

  /**
   * Executes the user events calculation logic
   *
   * @private
   * @returns {Promise<void>}
   */
  private userEventsCalculation = async (): Promise<void> => {
    try {
      await userEventMetric(
        this.dbService,
        this.logger.child('userEventMetric'),
      );

      this.logger.info('User events calculation job completed successfully');
    } catch (error) {
      this.logger.error(`User events calculation job failed: ${error}`);
      if (error instanceof Error && error.stack) {
        this.logger.debug(error.stack);
      }
    }
  };

  /**
   * Pre-start hook to prepare the service
   *
   * @protected
   * @returns {Promise<void>}
   */
  protected preStart = async (): Promise<void> => {};

  /**
   * Post-stop hook for cleanup
   *
   * @protected
   * @returns {Promise<void>}
   */
  protected postStop = async (): Promise<void> => {};

  /**
   * Builds a list of asynchronous tasks for user events calculation.
   *
   * @returns {Task[]}
   */
  protected getTasks = () => {
    const tasks = [];

    tasks.push({
      fn: async () => {
        this.logger.info(`Running ${this.name} job`);
        await this.userEventsCalculation();
      },
      interval: configs.statistics.userEventsMetric.interval * 1000,
    });
    return tasks;
  };
}
