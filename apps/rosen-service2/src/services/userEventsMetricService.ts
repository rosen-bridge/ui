import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import {
  Dependency,
  ServiceAction,
  ServiceStatus,
} from '@rosen-bridge/service-manager';
import { userEventMetric } from '@rosen-ui/rosen-statistics';

import { configs } from '../configs';
import {
  AbstractScannerService,
  AbstractDBService,
  AbstractUserEventsMetricService,
} from './abstracts';

export class UserEventsMetricService extends AbstractUserEventsMetricService {
  name = AbstractUserEventsMetricService.name;
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
      serviceName: AbstractScannerService.name,
      allowedStatuses: [ServiceStatus.running],
      action: ServiceAction.start,
    },
  ];

  /**
   * Protected constructor
   * @param {AbstractLogger} [logger] - Optional logger instance for recording service operations.
   */
  protected constructor(logger?: AbstractLogger) {
    super(logger);
  }

  /**
   * Assembles the service by initializing dependencies
   * @async
   * @returns {Promise<boolean>} Resolves to `true` when the assembly is successfully completed.
   */
  protected assemble = async (): Promise<boolean> => {
    this.dataSource = AbstractDBService.getInstance().getDataSource();
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
        this.dataSource,
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
