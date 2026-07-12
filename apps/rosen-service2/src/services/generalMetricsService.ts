import type { AbstractLogger } from '@rosen-bridge/abstract-logger';
import type { DataSource } from '@rosen-bridge/extended-typeorm';
import {
  type Dependency,
  ServiceAction,
  ServiceStatus,
} from '@rosen-bridge/service-manager';
import { generalMetrics } from '@rosen-ui/rosen-statistics';

import { configs } from '../configs';
import {
  AbstractDBService,
  AbstractGeneralMetricsService,
  AbstractTokenMapService,
} from './abstracts';

export class GeneralMetricsService extends AbstractGeneralMetricsService {
  static serviceName = AbstractGeneralMetricsService.name;
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
      serviceName: AbstractTokenMapService.name,
      allowedStatuses: [ServiceStatus.running, ServiceStatus.started],
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
   * Initializes the singleton instance of MetricsService
   *
   * @static
   * @param {AbstractLogger} [logger] - Optional logger instance
   * @memberof GeneralMetricsService
   */
  static init = (logger?: AbstractLogger) => {
    if (AbstractGeneralMetricsService.instance != undefined) {
      return;
    }
    AbstractGeneralMetricsService.instance = new GeneralMetricsService(logger);
  };

  /**
   * Executes the general metrics calculation job
   *
   * @private
   * @returns {Promise<void>}
   */
  private generalMetricsCalculation = async (): Promise<void> => {
    const tokenMap = AbstractTokenMapService.getInstance().getTokenMap();
    const rsnTokenId = configs.contracts.tokens.RSN;

    try {
      await generalMetrics(
        this.dataSource,
        tokenMap,
        rsnTokenId,
        this.logger.child('generalMetricsJob'),
      );

      this.logger.info(
        'General metrics calculation job completed successfully',
      );
    } catch (error) {
      this.logger.error(`General metrics calculation job failed: ${error}`);
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
   * Builds a list of asynchronous tasks for all metric jobs.
   *
   * @returns {Task[]}
   */
  protected getTasks = () => {
    const tasks = [];

    tasks.push({
      fn: async () => {
        try {
          this.logger.info(`Running ${this.getName()} job`);
          await this.generalMetricsCalculation();
        } catch (err) {
          this.logger.error(`${this.getName()} job failed: ${err}`);
          if (err instanceof Error && err.stack) {
            this.logger.debug(err.stack);
          }
        }
      },
      interval: configs.statistics.generalMetrics.interval * 1000,
    });
    return tasks;
  };
}
