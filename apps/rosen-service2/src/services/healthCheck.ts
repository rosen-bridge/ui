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

import { configs } from '../configs';
import {
  BINANCE_BLOCK_TIME,
  BITCOIN_BLOCK_TIME,
  CARDANO_BLOCK_TIME,
  DOGE_BLOCK_TIME,
  ERGO_BLOCK_TIME,
  ETHEREUM_BLOCK_TIME,
} from '../constants';
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

  private constructor(
    dbService: DBService,
    scannerService: ScannerService,
    logger?: AbstractLogger,
  ) {
    super(logger);
    this.dbService = dbService;
    this.scannerService = scannerService;

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
    if (configs.chains.cardano.active) {
      this.params.push(
        new ScannerSyncHealthCheckParam(
          NETWORKS.cardano.key,
          async () =>
            this.dbService.getLastSavedBlock(
              this.scannerService.getScanners()[NETWORKS.cardano.key]!.name(),
            ),
          configs.healthCheck.scanner.warnDiff,
          configs.healthCheck.scanner.criticalDiff,
          CARDANO_BLOCK_TIME * 1000,
        ),
      );
    }
    if (configs.chains.bitcoin.active) {
      this.params.push(
        new ScannerSyncHealthCheckParam(
          NETWORKS.bitcoin.key,
          async () =>
            this.dbService.getLastSavedBlock(
              this.scannerService.getScanners()[NETWORKS.bitcoin.key]!.name(),
            ),
          configs.healthCheck.scanner.warnDiff,
          configs.healthCheck.scanner.criticalDiff,
          BITCOIN_BLOCK_TIME * 1000,
        ),
      );
    }
    if (configs.chains.doge.active) {
      this.params.push(
        new ScannerSyncHealthCheckParam(
          NETWORKS.doge.key,
          async () =>
            this.dbService.getLastSavedBlock(
              this.scannerService.getScanners()[NETWORKS.doge.key]!.name(),
            ),
          configs.healthCheck.scanner.warnDiff,
          configs.healthCheck.scanner.criticalDiff,
          DOGE_BLOCK_TIME * 1000,
        ),
      );
    }
    if (configs.chains.ethereum.active) {
      this.params.push(
        new ScannerSyncHealthCheckParam(
          NETWORKS.ethereum.key,
          async () =>
            this.dbService.getLastSavedBlock(
              this.scannerService.getScanners()[NETWORKS.ethereum.key]!.name(),
            ),
          configs.healthCheck.scanner.warnDiff,
          configs.healthCheck.scanner.criticalDiff,
          ETHEREUM_BLOCK_TIME * 1000,
        ),
      );
    }
    if (configs.chains.binance.active) {
      this.params.push(
        new ScannerSyncHealthCheckParam(
          NETWORKS.binance.key,
          async () =>
            this.dbService.getLastSavedBlock(
              this.scannerService.getScanners()[NETWORKS.binance.key]!.name(),
            ),
          configs.healthCheck.scanner.warnDiff,
          configs.healthCheck.scanner.criticalDiff,
          BINANCE_BLOCK_TIME * 1000,
        ),
      );
    }
  }

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
    this.instance = new HealthService(
      DBService.getInstance(),
      ScannerService.getInstance(),
      logger,
    );
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
    this.setStatus(ServiceStatus.started);
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
            const isHealthy =
              (
                await this.healthCheck.getHealthStatusWithParamId(
                  this.params[0].getId(),
                )
              )?.status == HealthStatusLevel.HEALTHY;
            if (isHealthy) {
              this.setStatus(ServiceStatus.running);
            } else {
              this.setStatus(ServiceStatus.started);
            }
            this.logger.debug('periodic health check update done');
            this.logger.info(
              `Health-check status is ${this.healthCheck.getHealthStatus().map((p) => `${p.id}=${p.status}`)}`,
            );
          } catch (error) {
            this.logger.error('failed to start health-check', error);
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
