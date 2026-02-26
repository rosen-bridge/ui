import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import {
  Dependency,
  PeriodicTaskService,
  ServiceStatus,
} from '@rosen-bridge/service-manager';
import { userEventMetric } from '@rosen-ui/rosen-statistics';

import { configs } from '../configs';
import { DBService } from './db';

export class UserEventsMetricService extends PeriodicTaskService {
  name = 'UserEventsMetricService';
  private static instance: UserEventsMetricService;
  readonly dbService: DBService;
  protected dependencies: Dependency[] = [
    {
      serviceName: DBService.name,
      allowedStatuses: [ServiceStatus.running],
    },
  ];

  private constructor(logger?: AbstractLogger) {
    super(logger);
    this.dbService = DBService.getInstance();
  }

  /**
   * Initializes the singleton instance of UserEventsMetricService
   *
   * @static
   * @param {AbstractLogger} [logger] - Optional logger instance
   * @memberof UserEventsMetricService
   */
  static init = (logger?: AbstractLogger) => {
    if (this.instance != undefined) {
      return;
    }
    this.instance = new UserEventsMetricService(logger);
  };

  /**
   * Returns the singleton instance of UserEventsMetricService
   *
   * @static
   * @return {UserEventsMetricService}
   * @memberof UserEventsMetricService
   */
  static getInstance = (): UserEventsMetricService => {
    if (!this.instance) {
      throw new Error(`${this.name} instance is not initialized yet`);
    }
    return this.instance;
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
        this.dbService.dataSource,
        this.logger.child('userEventsCalculationJob'),
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
  protected preStart = async (): Promise<void> => {
    this.setStatus(ServiceStatus.started);
    this.logger.info('UserEventsMetricService started successfully');
  };

  /**
   * Post-stop hook for cleanup
   *
   * @protected
   * @returns {Promise<void>}
   */
  protected postStop = async (): Promise<void> => {
    this.logger.info('UserEventsMetricService stopped');
  };

  /**
   * Builds a list of asynchronous tasks for user events calculation.
   *
   * @returns {Task[]}
   */
  protected getTasks = () => {
    const tasks = [];

    tasks.push({
      fn: async () => {
        try {
          this.logger.info(`Running ${this.name} job`);
          await this.userEventsCalculation();
        } catch (err) {
          this.logger.error(`${this.name} job failed: ${err}`);
          if (err instanceof Error && err.stack) {
            this.logger.debug(err.stack);
          }
        }
      },
      interval: configs.statistics.userEventsMetric.interval * 1000,
    });
    return tasks;
  };
}
