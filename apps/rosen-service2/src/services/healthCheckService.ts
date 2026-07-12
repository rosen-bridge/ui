import type { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { DiscordNotification } from '@rosen-bridge/discord-notification';
import {
  type AbstractHealthCheckParam,
  HealthCheck,
  HealthStatusLevel,
} from '@rosen-bridge/health-check';
import { LogLevelHealthCheck } from '@rosen-bridge/log-level-check';
import {
  type LastSavedBlock,
  ScannerSyncHealthCheckParam,
} from '@rosen-bridge/scanner-sync-check';
import {
  type Dependency,
  ServiceAction,
  ServiceStatus,
} from '@rosen-bridge/service-manager';
import { NETWORKS } from '@rosen-ui/constants';
import fs from 'node:fs';
import path from 'node:path';

import { configs } from '../configs';
import {
  BLOCK_TIMES,
  type ChainScannersType,
  type Chains,
  type ChainsKeys,
  type ChainsWithScanner,
} from '../types';
import {
  AbstractDBService,
  AbstractHealthService,
  AbstractScannerService,
} from './abstracts';

export class HealthService extends AbstractHealthService {
  static serviceName = AbstractHealthService.name;
  private getLastSavedBlock: (scanner: string) => Promise<LastSavedBlock>;
  private getScanner: (chain: keyof Chains) => ChainScannersType | undefined;
  protected healthCheck: HealthCheck;
  protected params: AbstractHealthCheckParam[] = [];
  protected dependencies: Dependency[] = [
    {
      serviceName: AbstractDBService.name,
      allowedStatuses: [
        ServiceStatus.started,
        ServiceStatus.running,
        ServiceStatus.dormant,
      ],
      action: ServiceAction.assemble,
    },
    {
      serviceName: AbstractScannerService.name,
      allowedStatuses: [
        ServiceStatus.started,
        ServiceStatus.running,
        ServiceStatus.dormant,
      ],
      action: ServiceAction.assemble,
    },
  ];

  /**
   * Assembles the service by initializing dependencies
   * @async
   * @returns {Promise<boolean>} Resolves to `true` when the assembly is successfully completed.
   */
  protected assemble = async (): Promise<boolean> => {
    this.getLastSavedBlock = AbstractDBService.getInstance().getLastSavedBlock;
    this.getScanner = AbstractScannerService.getInstance().getScanner;
    this.setStatus(ServiceStatus.dormant);

    let notify;
    let notificationConfig;
    if (configs.healthCheck.notification?.discordWebHookUrl != undefined) {
      const discordNotification = new DiscordNotification(
        configs.healthCheck.notification.discordWebHookUrl,
      );
      notify = discordNotification.notify;
      notificationConfig = {
        historyConfig: {
          cleanupThreshold:
            configs.healthCheck.notification.historyCleanupTimeout,
        },
        notificationCheckConfig: {
          hasBeenUnstableForAWhile: {
            windowDuration:
              configs.healthCheck.notification
                .hasBeenUnstableForAWhileWindowDuration,
          },
          hasBeenUnknownForAWhile: {
            windowDuration:
              configs.healthCheck.notification
                .hasBeenUnknownForAWhileWindowDuration,
          },
        },
      };
    }
    this.healthCheck = new HealthCheck(notify, notificationConfig);
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
   * Adds a new ScannerSyncHealthCheckParam to the internal params array.
   *
   * @param chain - The key of the blockchain
   * @param blockTimeAsMilliSecond - Expected average block time in milliseconds
   */
  protected addScannerSyncParam = (
    chain: ChainsKeys,
    blockTimeAsMilliSecond: number,
  ) => {
    const scanner = this.getScanner(chain);

    if (!scanner) {
      this.logger.warn(`Scanner not found for chain: ${chain}.`);
    } else {
      this.params.push(
        new ScannerSyncHealthCheckParam(
          chain,
          async () => this.getLastSavedBlock(scanner.name()),
          configs.healthCheck.scanner.warnDiff,
          configs.healthCheck.scanner.criticalDiff,
          blockTimeAsMilliSecond * 1000,
        ),
      );
    }
  };

  /**
   * Initializes the singleton instance of HealthService
   *
   * @static
   * @memberof HealthService
   */
  static readonly init = (logger?: AbstractLogger) => {
    if (AbstractHealthService.instance != undefined) {
      return;
    }
    AbstractHealthService.instance = new HealthService(logger);
  };

  /**
   * start health-check scanner task
   *
   * @returns void
   */
  protected preStart = async () => {
    this.params = [
      new LogLevelHealthCheck(
        HealthStatusLevel.UNSTABLE,
        configs.healthCheck.logging.maxWarns,
        configs.healthCheck.logging.duration * 1000,
        'warn',
      ),
      new LogLevelHealthCheck(
        HealthStatusLevel.UNSTABLE,
        configs.healthCheck.logging.maxErrors,
        configs.healthCheck.logging.duration * 1000,
        'error',
      ),
    ];

    // Add chains Scanner params
    this.addScannerSyncParam(NETWORKS.ergo.key, BLOCK_TIMES.ergo);
    (Object.keys(configs.chains) as ChainsWithScanner[]).forEach((chain) => {
      if (chain !== NETWORKS.ergo.key && configs.chains[chain].active) {
        const blockTime = BLOCK_TIMES[chain];
        this.addScannerSyncParam(chain, blockTime);
      }
    });
    for (const param of this.params) {
      this.healthCheck.register(param);
      this.logger.debug(`${param.getId()} health param registered`);
    }
  };

  /**
   * Updates the health check status and exports the results to a JSON file.
   *
   */
  protected updateAndExportHealthStatus = async () => {
    this.logger.info('Starting the update healthCheck status');
    await this.healthCheck.update();
    this.logger.debug('periodic health check update done');
    const healthStatus = Object.fromEntries(
      this.healthCheck.getHealthStatus().map((p) => [p.id, p.status]),
    );
    const healthReportPath = path.isAbsolute(configs.paths.healthReport)
      ? configs.paths.healthReport
      : path.resolve(process.cwd(), configs.paths.healthReport);

    this.logger.debug(`Health-check status is ${JSON.stringify(healthStatus)}`);
    fs.writeFileSync(
      healthReportPath,
      JSON.stringify(healthStatus, null, 2),
      'utf8',
    );
  };

  /**
   * Builds a list of asynchronous tasks for health-check scanner.
   *
   * @returns {Task[]}
   */
  protected getTasks = () => {
    return [
      {
        fn: this.updateAndExportHealthStatus,
        interval: configs.healthCheck.updateInterval * 1000,
      },
    ];
  };

  /**
   * Post-stop action of service.
   *
   * @protected
   * @return {Promise<boolean>} true if service stopped successfully
   * @memberof HealthService
   */
  protected postStop = async () => {
    for (const param of this.params) {
      this.healthCheck.unregister(param.getId());
      this.logger.debug(`${param.getId()} health param unregistered`);
    }
  };
}
