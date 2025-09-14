import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';
import { DiscordNotification } from '@rosen-bridge/discord-notification';
import {
  AbstractHealthCheckParam,
  HealthCheck,
  HealthStatusLevel,
} from '@rosen-bridge/health-check';
import { LogLevelHealthCheck } from '@rosen-bridge/log-level-check';
import { ScannerSyncHealthCheckParam } from '@rosen-bridge/scanner-sync-check';
import {
  Dependency,
  PeriodicTaskService,
  ServiceStatus,
} from '@rosen-bridge/service-manager';
import { NETWORKS } from '@rosen-ui/constants';
import fs from 'node:fs';
import path from 'node:path';

import { configs } from '../configs';
import {
  BINANCE_BLOCK_TIME,
  BITCOIN_BLOCK_TIME,
  CARDANO_BLOCK_TIME,
  DOGE_BLOCK_TIME,
  ERGO_BLOCK_TIME,
  ETHEREUM_BLOCK_TIME,
} from '../constants';
import { ChainsKeys } from '../types';
import { DBService } from './db';
import { ScannerService } from './scanner';

export class HealthService extends PeriodicTaskService {
  name = 'HealthService';
  taskName = 'HealthService';

  private static instance: HealthService;
  readonly dbService: DBService;
  readonly scannerService: ScannerService;
  protected healthCheck: HealthCheck;
  protected params: AbstractHealthCheckParam[] = [];
  protected dependencies: Dependency[] = [
    {
      serviceName: DBService.name,
      allowedStatuses: [ServiceStatus.running],
    },
    {
      serviceName: ScannerService.name,
      allowedStatuses: [ServiceStatus.started],
    },
  ];

  private constructor(logger?: AbstractLogger) {
    super(logger);
    this.dbService = DBService.getInstance();
    this.scannerService = ScannerService.getInstance();

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
    this.params = [
      new ScannerSyncHealthCheckParam(
        NETWORKS.ergo.key,
        async () => this.dbService.getLastSavedBlock(NETWORKS.ergo.key),
        configs.healthCheck.scanner.warnDiff,
        configs.healthCheck.scanner.criticalDiff,
        ERGO_BLOCK_TIME * 1000,
      ),
      new LogLevelHealthCheck(
        CallbackLoggerFactory.getInstance(),
        HealthStatusLevel.UNSTABLE,
        configs.healthCheck.logging.maxWarns,
        configs.healthCheck.logging.duration * 1000,
        'warn',
      ),
      new LogLevelHealthCheck(
        CallbackLoggerFactory.getInstance(),
        HealthStatusLevel.UNSTABLE,
        configs.healthCheck.logging.maxErrors,
        configs.healthCheck.logging.duration * 1000,
        'error',
      ),
    ];

    // Add chains Scanner params
    if (configs.chains.cardano.active)
      this.addScannerSyncParam(NETWORKS.cardano.key, CARDANO_BLOCK_TIME);
    if (configs.chains.bitcoin.active)
      this.addScannerSyncParam(NETWORKS.bitcoin.key, BITCOIN_BLOCK_TIME);
    if (configs.chains.doge.active)
      this.addScannerSyncParam(NETWORKS.doge.key, DOGE_BLOCK_TIME);
    if (configs.chains.ethereum.active)
      this.addScannerSyncParam(NETWORKS.ethereum.key, ETHEREUM_BLOCK_TIME);
    if (configs.chains.binance.active)
      this.addScannerSyncParam(NETWORKS.binance.key, BINANCE_BLOCK_TIME);
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
    this.params.push(
      new ScannerSyncHealthCheckParam(
        chain,
        async () =>
          this.dbService.getLastSavedBlock(
            this.scannerService.getScanners()[chain]!.name(),
          ),
        configs.healthCheck.scanner.warnDiff,
        configs.healthCheck.scanner.criticalDiff,
        blockTimeAsMilliSecond * 1000,
      ),
    );
  };

  /**
   * initializes the singleton instance of HealthService
   *
   * @static
   * @param {DBService} [dbService]
   * @param {ScannerService} [ergoScannerService]
   * @memberof HealthService
   */
  static readonly init = (logger?: AbstractLogger) => {
    if (this.instance != undefined) {
      return;
    }
    this.instance = new HealthService(logger);
  };

  /**
   * return the singleton instance of HealthService
   *
   * @static
   * @return {HealthService}
   * @memberof HealthService
   */
  static readonly getInstance = (): HealthService => {
    if (!this.instance) {
      throw new Error('HealthService instances is not initialized yet');
    }
    return this.instance;
  };

  /**
   * start health-check scanner task
   *
   * @returns void
   */
  protected preStart = async () => {
    for (const param of this.params)
      try {
        this.healthCheck.register(param);
        this.logger.debug(`${param.getId()} health param registered`);
      } catch (err) {
        this.logger.error(
          `Registering healthCheck ${param.getId()} parameter failed: ${err}`,
        );
        if (err instanceof Error && err.stack) this.logger.debug(err.stack);
      }
  };

  /**
   * Builds a list of asynchronous tasks for health-check scanner.
   *
   * @returns {Task[]}
   */
  protected getTasks = () => {
    return [
      {
        fn: async () => {
          this.logger.info('Starting the update healthCheck status');
          try {
            await this.healthCheck.update();
            this.logger.debug('periodic health check update done');
            const healthStatus = Object.fromEntries(
              this.healthCheck.getHealthStatus().map((p) => [p.id, p.status]),
            );
            const healthReportPath = path.isAbsolute(configs.paths.healthReport)
              ? configs.paths.healthReport
              : path.resolve(process.cwd(), configs.paths.healthReport);

            this.logger.debug(
              `Health-check status is ${JSON.stringify(healthStatus)}`,
            );
            fs.writeFileSync(
              healthReportPath,
              JSON.stringify(healthStatus, undefined, 4),
            );
          } catch (error) {
            this.logger.error(`failed to update health-check: ${error}`);
            if (error instanceof Error && error.stack)
              this.logger.debug(error.stack);
          }
        },
        interval: configs.healthCheck.updateInterval * 1000,
      },
    ];
  };

  /**
   * post-stop action of service.
   *
   * @protected
   * @return {Promise<boolean>} true if service stopped successfully
   * @memberof HealthService
   */
  protected postStop = async () => {
    for (const param of this.params)
      try {
        this.healthCheck.unregister(param.getId());
        this.logger.debug(`${param.getId()} health param unregistered`);
      } catch (err) {
        this.logger.error(
          `Unregistering healthCheck ${param.getId()} parameter failed: ${err}`,
        );
        if (err instanceof Error && err.stack) this.logger.debug(err.stack);
      }
  };
}
