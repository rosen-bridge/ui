import type { ChainConfigs } from 'types';

import type { AbstractLogger } from '@rosen-bridge/abstract-logger';
import type { DataSource } from '@rosen-bridge/extended-typeorm';
import { type Dependency, ServiceAction, ServiceStatus } from '@rosen-bridge/service-manager';
import { type WatcherCountConfig, watcherCountMetric } from '@rosen-ui/rosen-statistics';

import { configs } from '../configs';
import { AbstractDBService, AbstractWatcherCountMetricService } from './abstracts';

export class WatcherCountMetricService extends AbstractWatcherCountMetricService {
  static serviceName = AbstractWatcherCountMetricService.name;
  private dataSource: DataSource;
  protected dependencies: Dependency[] = [
    {
      serviceName: AbstractDBService.name,
      allowedStatuses: [ServiceStatus.running, ServiceStatus.started, ServiceStatus.dormant],
      action: ServiceAction.assemble,
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
   * Initializes the singleton instance of WatcherCountMetricService
   *
   * @static
   * @param {AbstractLogger} [logger] - Optional logger instance
   * @memberof WatcherCountMetricService
   */
  static init = (logger?: AbstractLogger) => {
    if (AbstractWatcherCountMetricService.instance != undefined) {
      return;
    }
    AbstractWatcherCountMetricService.instance = new WatcherCountMetricService(logger);
  };

  /**
   * Executes the watcher count calculation logic
   *
   * @private
   * @returns {Promise<void>}
   */
  private watcherCountCalculation = async (): Promise<void> => {
    this.logger.info(`Running ${this.getName()} job`);

    const rwtRepoNFT = configs.contracts.tokens.RWTRepoNFT;
    const url = configs.statistics.watcherCountMetrics.nodeUrl;
    const rwtTokenMap = new Map<string, string>();
    for (const [chain, chainConfig] of Object.entries(configs.contracts)) {
      if (chain === 'version' || chain === 'tokens') continue;
      const rwtId = (chainConfig as ChainConfigs).tokens.RWTId;
      rwtTokenMap.set(rwtId, chain);
    }
    const watcherCountConfig: WatcherCountConfig = {
      url,
      rwtRepoNFT,
      rwtTokenMap,
    };
    try {
      await watcherCountMetric(
        this.dataSource,
        watcherCountConfig,
        this.logger.child('watcherCountMetric'),
      );

      this.logger.info('Watcher count calculation job completed successfully');
    } catch (error) {
      this.logger.error(`Watcher count calculation job failed: ${error}`);
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
   * Builds a list of asynchronous tasks for watcher count calculation.
   *
   * @returns {Task[]}
   */
  protected getTasks = () => {
    return [
      {
        fn: async () => {
          await this.watcherCountCalculation();
        },
        interval: configs.statistics.watcherCountMetrics.interval * 1000,
      },
    ];
  };
}
