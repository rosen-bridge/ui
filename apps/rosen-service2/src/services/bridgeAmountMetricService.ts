import type { AbstractLogger } from '@rosen-bridge/abstract-logger';
import type { DataSource } from '@rosen-bridge/extended-typeorm';
import { type Dependency, ServiceAction, ServiceStatus } from '@rosen-bridge/service-manager';
import { bridgeAmountMetric } from '@rosen-ui/rosen-statistics';

import { configs } from '../configs';
import {
  AbstractBridgeAmountMetricService,
  AbstractDBService,
  AbstractScannerService,
} from './abstracts';

export class BridgeAmountMetricService extends AbstractBridgeAmountMetricService {
  static serviceName = AbstractBridgeAmountMetricService.name;
  private dataSource: DataSource;
  protected dependencies: Dependency[] = [
    {
      serviceName: AbstractDBService.name,
      allowedStatuses: [ServiceStatus.running, ServiceStatus.started, ServiceStatus.dormant],
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
   * Initializes the singleton instance of BridgeAmountMetricService
   *
   * @static
   * @param {AbstractLogger} [logger] - Optional logger instance
   * @memberof BridgeAmountMetricService
   */
  static init = (logger?: AbstractLogger) => {
    if (AbstractBridgeAmountMetricService.instance != undefined) {
      return;
    }
    AbstractBridgeAmountMetricService.instance = new BridgeAmountMetricService(logger);
  };

  /**
   * Executes the bridge amount calculation logic
   *
   * @private
   * @returns {Promise<void>}
   */
  private bridgeAmountCalculation = async (): Promise<void> => {
    try {
      await bridgeAmountMetric(this.dataSource, this.logger.child('bridgeAmountMetric'));

      this.logger.info('Bridge amount calculation job completed successfully');
    } catch (error) {
      this.logger.error(`Bridge amount calculation job failed: ${error}`);
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
   * Builds a list of asynchronous tasks for bridge amount calculation.
   *
   * @returns {Task[]}
   */
  protected getTasks = () => {
    const tasks = [];

    tasks.push({
      fn: async () => {
        this.logger.info(`Running ${this.getName()} job`);
        await this.bridgeAmountCalculation();
      },
      interval: configs.statistics.watcherCountMetrics.interval * 1000,
    });
    return tasks;
  };
}
