import type { AbstractLogger } from '@rosen-bridge/abstract-logger';
import type { DataSource } from '@rosen-bridge/extended-typeorm';
import { type Dependency, ServiceAction, ServiceStatus } from '@rosen-bridge/service-manager';
import { bridgeFeeMetric } from '@rosen-ui/rosen-statistics';

import { configs } from '../configs';
import {
  AbstractBridgeFeeMetricService,
  AbstractDBService,
  AbstractScannerService,
} from './abstracts';

export class BridgeFeeMetricService extends AbstractBridgeFeeMetricService {
  static serviceName = AbstractBridgeFeeMetricService.name;
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
   * Initializes the singleton instance of BridgeFeeMetricService
   *
   * @static
   * @param {AbstractLogger} [logger] - Optional logger instance
   * @memberof BridgeFeeMetricService
   */
  static init = (logger?: AbstractLogger) => {
    if (AbstractBridgeFeeMetricService.instance != undefined) {
      return;
    }
    AbstractBridgeFeeMetricService.instance = new BridgeFeeMetricService(logger);
  };

  /**
   * Executes the bridge fee calculation logic
   *
   * @private
   * @returns {Promise<void>}
   */
  private bridgeFeeCalculation = async (): Promise<void> => {
    this.logger.info(`Running ${this.getName()} job`);

    try {
      await bridgeFeeMetric(this.dataSource, this.logger.child('bridgeFeeMetric'));

      this.logger.info('Bridge fee calculation job completed successfully');
    } catch (error) {
      this.logger.error(`Bridge fee calculation job failed: ${error}`);
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
   * Builds a list of asynchronous tasks for bridge fee calculation.
   *
   * @returns {Task[]}
   */
  protected getTasks = () => {
    return [
      {
        fn: async () => {
          await this.bridgeFeeCalculation();
        },
        interval: configs.statistics.bridgeFeeMetrics.interval * 1000,
      },
    ];
  };
}
