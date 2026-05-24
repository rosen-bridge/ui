import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import {
  Dependency,
  ServiceAction,
  ServiceStatus,
} from '@rosen-bridge/service-manager';
import { eventCountMetric } from '@rosen-ui/rosen-statistics';

import { configs } from '../configs';
import { DBService } from './db';
import { AbstractEventCountMetricService } from './types/abstractEventCountMetricService';
import { AbstractScannerService } from './types/abstractScannerService';
import { AbstractDBService } from './types/abstrctDb';

export class EventCountMetricService extends AbstractEventCountMetricService {
  name = AbstractEventCountMetricService.Name;
  private dataSource: DataSource;
  protected dependencies: Dependency[] = [
    {
      serviceName: AbstractDBService.Name(),
      allowedStatuses: [ServiceStatus.running, ServiceStatus.started, ServiceStatus.dormant],
      action: ServiceAction.assemble,
    },
    {
      serviceName: AbstractScannerService.Name(),
      allowedStatuses: [ServiceStatus.running],
      action: ServiceAction.start,
    },
  ];

  protected assemble = async (): Promise<boolean> => {
    this.dataSource = DBService.getInstance().getDataSource();
    this.setStatus(ServiceStatus.dormant);
    return true;
  };

  private constructor(logger?: AbstractLogger) {
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
