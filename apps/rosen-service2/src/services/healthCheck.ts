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
  AbstractService,
  Dependency,
  ServiceStatus,
} from '@rosen-bridge/service-manager';
import { NETWORKS } from '@rosen-ui/constants';

import { configs } from '../configs';
import { ERGO_BLOCK_TIME } from '../constants';
import { DBService } from './db';
import { ErgoScannerService } from './ergoScanner';

export class HealthService extends AbstractService {
  name = 'HealthService';
  private static instance: HealthService;
  readonly dbService: DBService;
  readonly ergoScannerService: ErgoScannerService;
  private shouldStop = false;
  private latestTimeOut: undefined | ReturnType<typeof setTimeout>;
  protected healthCheck: HealthCheck;
  protected params: AbstractHealthCheckParam[] = [];
  private continueStop = () => {
    return;
  };
  protected dependencies: Dependency[] = [
    {
      serviceName: DBService.name,
      allowedStatuses: [ServiceStatus.running],
    },
    {
      serviceName: ErgoScannerService.name,
      allowedStatuses: [ServiceStatus.started],
    },
  ];

  private constructor(
    dbService: DBService,
    ergoScannerService: ErgoScannerService,
    logger?: AbstractLogger,
  ) {
    super(logger);
    this.dbService = dbService;
    this.ergoScannerService = ergoScannerService;

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
  }

  /**
   * initializes the singleton instance of HealthService
   *
   * @static
   * @param {DBService} [dbService]
   * @param {ErgoScannerService} [ergoScannerService]
   * @memberof HealthService
   */
  static readonly init = (
    dbService: DBService,
    ergoScannerService: ErgoScannerService,
    logger?: AbstractLogger,
  ) => {
    if (this.instance != undefined) {
      return;
    }
    this.instance = new HealthService(dbService, ergoScannerService, logger);
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
   * Register a new health check parameter
   * @param param - Health check parameter instance to register
   */
  public registerHealthParam = (param: AbstractHealthCheckParam) => {
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
   * Unregister a health check parameter by its ID
   * @param paramId - ID of the health check parameter to unregister
   */
  public unregisterHealthParam = (paramId: string) => {
    try {
      this.healthCheck.unregister(paramId);
      this.logger.debug(`${paramId} health param unregistered`);
    } catch (err) {
      this.logger.error(
        `Unregistering healthCheck ${paramId} parameter failed: ${err}`,
      );
      if (err instanceof Error && err.stack) this.logger.debug(err.stack);
    }
  };

  /**
   * starts the service.
   *
   * @protected
   * @return {Promise<boolean>} true if service started successfully, otherwise
   * false
   * @memberof HealthService
   */
  protected start = async (): Promise<boolean> => {
    this.shouldStop = false;

    for (const instance of this.params) this.registerHealthParam(instance);

    this.setStatus(ServiceStatus.started);
    this.updateHealthStatus();
    return true;
  };

  /**
   * Scan and fetch ErgoObservationExtractor boxes data
   * @returns {boolean}
   */
  protected updateHealthStatus = async () => {
    this.latestTimeOut = undefined;
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

    const scheduled = setTimeout(
      () => this.updateHealthStatus(),
      configs.healthCheck.updateInterval * 1000,
    );

    if (this.shouldStop) {
      this.shouldStop = false;
      clearTimeout(scheduled);
      this.continueStop();
    } else {
      this.latestTimeOut = scheduled;
    }

    return true;
  };

  /**
   * stops the service.
   *
   * @protected
   * @return {Promise<boolean>} true if service stopped successfully
   * @memberof HealthService
   */
  protected stop = async (): Promise<boolean> => {
    if (this.latestTimeOut) {
      await new Promise<void>((resolve) => {
        this.continueStop = resolve;
        this.shouldStop = true;
      });
    }
    clearTimeout(this.latestTimeOut);
    for (const instance of this.params)
      this.unregisterHealthParam(instance.getId());
    this.shouldStop = false;
    this.setStatus(ServiceStatus.dormant);
    return true;
  };
}
