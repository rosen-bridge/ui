import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import {
  Dependency,
  ServiceAction,
  ServiceStatus,
} from '@rosen-bridge/service-manager';
import { generalMetrics } from '@rosen-ui/rosen-statistics';

import { configs } from '../configs';
import { AbstractGeneralMetricsService } from './types/abstractGeneralMetricsService';
import { AbstractTokenMapService } from './types/abstractTokenMapService';
import { AbstractDBService } from './types/abstrctDb';

export class GeneralMetricsService extends AbstractGeneralMetricsService {
  name = 'GeneralMetricsService';
  readonly dbService: AbstractDBService;
  protected dependencies: Dependency[] = [
    {
      serviceName: AbstractDBService.getInstance().getName(),
      allowedStatuses: [ServiceStatus.running],
      action: ServiceAction.start,
    },
  ];

  assemble = async (): Promise<boolean> => {
    this.setStatus(ServiceStatus.dormant);
    return true;
  };

  private constructor(logger?: AbstractLogger) {
    super(logger);
    this.dbService = AbstractDBService.getInstance();
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
        this.dbService.getDataSource(),
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
  protected preStart = async (): Promise<void> => {
    this.setStatus(ServiceStatus.started);
    this.logger.info('GeneralMetricsService started successfully');
  };

  /**
   * Post-stop hook for cleanup
   *
   * @protected
   * @returns {Promise<void>}
   */
  protected postStop = async (): Promise<void> => {
    this.logger.info('GeneralMetricsService stopped');
  };

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
          this.logger.info(`Running ${this.name} job`);
          await this.generalMetricsCalculation();
        } catch (err) {
          this.logger.error(`${this.name} job failed: ${err}`);
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
