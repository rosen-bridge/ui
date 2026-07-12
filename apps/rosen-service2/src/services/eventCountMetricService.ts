import type { AbstractLogger } from '@rosen-bridge/abstract-logger';
import type { DataSource } from '@rosen-bridge/extended-typeorm';
import {
  type Dependency,
  ServiceAction,
  ServiceStatus,
} from '@rosen-bridge/service-manager';
import { eventCountMetric } from '@rosen-ui/rosen-statistics';

import { configs } from '../configs';
import {
  AbstractDBService,
  AbstractEventCountMetricService,
  AbstractScannerService,
} from './abstracts';

export class EventCountMetricService extends AbstractEventCountMetricService {
  static serviceName = AbstractEventCountMetricService.name;
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
   * Protected constructor
   * @param {AbstractLogger} [logger] - Optional logger instance for recording service operations.
   */
  protected constructor(logger?: AbstractLogger) {
    super(logger);
  }

  /**
   * Initializes the singleton instance of event count metric service
   *
   * @static
   * @param {AbstractLogger} [logger] - Optional logger instance
   * @memberof EventCountMetricService
   */
  static init = (logger?: AbstractLogger) => {
    if (AbstractEventCountMetricService.instance != undefined) {
      return;
    }
    AbstractEventCountMetricService.instance = new EventCountMetricService(
      logger,
    );
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
        this.dataSource,
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
      fn: async () => await this.eventCountCalculation(),
      interval: configs.statistics.eventCountMetrics.interval * 1000,
    });
    return tasks;
  };
}
