import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import {
  Dependency,
  PeriodicTaskService,
  ServiceStatus,
} from '@rosen-bridge/service-manager';
import { eventCountMetric } from '@rosen-ui/rosen-statistics';

import { configs } from '../configs';
import { DBService } from './db';
import { ScannerService } from './scanner';

export class EventCountMetricService extends PeriodicTaskService {
  name = 'EventCountMetricService';
  private static instance: EventCountMetricService;
  readonly dbService: DBService;
  protected dependencies: Dependency[] = [
    {
      serviceName: DBService.name,
      allowedStatuses: [ServiceStatus.running],
    },
    {
      serviceName: ScannerService.name,
      allowedStatuses: [ServiceStatus.running],
    },
  ];

  private constructor(logger?: AbstractLogger) {
    super(logger);
    this.dbService = DBService.getInstance();
  }

  /**
   * Initializes the singleton instance of event count metric service
   *
   * @static
   * @param {AbstractLogger} [logger] - Optional logger instance
   * @memberof EventCountMetricService
   */
  static init = (logger?: AbstractLogger) => {
    if (this.instance != undefined) {
      return;
    }
    this.instance = new EventCountMetricService(logger);
  };

  /**
   * Returns the singleton instance of event count metric service
   *
   * @static
   * @return {EventCountMetricService} The singleton instance
   * @memberof EventCountMetricService
   */
  static getInstance = (): EventCountMetricService => {
    if (!this.instance) {
      throw new Error(`${this.name} instance is not initialized yet`);
    }
    return this.instance;
  };

  /**
   * Executes the event count calculation logic
   *
   * @private
   * @returns {Promise<void>}
   */
  private eventCountCalculation = async (): Promise<void> => {
    try {
      await eventCountMetric(
        this.dbService.dataSource,
        this.logger.child('eventCountMetric'),
      );

      this.logger.info('Event count calculation job completed successfully');
    } catch (error) {
      this.logger.error(`Event count calculation job failed: ${error}`);
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
   * Builds a list of asynchronous tasks for event count calculation.
   *
   * @returns {Task[]}
   */
  protected getTasks = () => {
    const tasks = [];

    tasks.push({
      fn: async () => {
        try {
          this.logger.info(`Running ${this.name} job`);
          await this.eventCountCalculation();
        } catch (err) {
          this.logger.error(`${this.name} job failed: ${err}`);
          if (err instanceof Error && err.stack) {
            this.logger.debug(err.stack);
          }
        }
      },
      interval: configs.statistics.eventCountMetrics.interval * 1000,
    });
    return tasks;
  };
}
