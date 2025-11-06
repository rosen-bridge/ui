import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';
import { DiscordNotification } from '@rosen-bridge/discord-notification';
import { HealthCheck, HealthStatusLevel } from '@rosen-bridge/health-check';
import { LogLevelHealthCheck } from '@rosen-bridge/log-level-check';
import { ScannerSyncHealthCheckParam } from '@rosen-bridge/scanner-sync-check';
import fs from 'node:fs';
import path from 'node:path';

import config from '../configs';
import {
  BINANCE_BLOCK_TIME,
  BITCOIN_BLOCK_TIME,
  CARDANO_BLOCK_TIME,
  DOGE_BLOCK_TIME,
  ERGO_BLOCK_TIME,
  ETHEREUM_BLOCK_TIME,
} from '../constants';
import scannerService from '../scanner/scanner-service';
import { getLastSavedBlock } from './health-check-utils';

const logger = CallbackLoggerFactory.getInstance().getLogger(import.meta.url);

/**
 * Get notify and notificationConfig if discord is configured
 */
const getNotifySetup = () => {
  if (!config.notification.discordWebHookUrl) {
    return { notify: undefined, notificationConfig: undefined };
  }

  const discordNotification = new DiscordNotification(
    config.notification.discordWebHookUrl,
  );
  const notificationConfig = {
    historyConfig: {
      cleanupThreshold: config.notification.historyCleanupTimeout,
    },
    notificationCheckConfig: {
      hasBeenUnstableForAWhile: {
        windowDuration:
          config.notification.hasBeenUnstableForAWhileWindowDuration,
      },
      hasBeenUnknownForAWhile: {
        windowDuration:
          config.notification.hasBeenUnknownForAWhileWindowDuration,
      },
    },
  };
  return { notify: discordNotification.notify, notificationConfig };
};

/**
 * Registers all health checks
 */
const registerAllHealthChecks = (healthCheck: HealthCheck) => {
  const checks = [
    {
      instance: new ScannerSyncHealthCheckParam(
        scannerService.getErgoScanner().name(),
        async () => getLastSavedBlock(scannerService.getErgoScanner().name()),
        config.healthCheck.ergoScannerWarnDiff,
        config.healthCheck.ergoScannerCriticalDiff,
        ERGO_BLOCK_TIME,
      ),
      label: 'ergo',
    },
    {
      instance: new ScannerSyncHealthCheckParam(
        scannerService.getCardanoScanner().name(),
        async () =>
          getLastSavedBlock(scannerService.getCardanoScanner().name()),
        config.healthCheck.cardanoScannerWarnDiff,
        config.healthCheck.cardanoScannerCriticalDiff,
        CARDANO_BLOCK_TIME,
      ),
      label: 'cardano',
    },
    {
      instance: new ScannerSyncHealthCheckParam(
        scannerService.getBitcoinScanner().name(),
        async () =>
          getLastSavedBlock(scannerService.getBitcoinScanner().name()),
        config.healthCheck.bitcoinScannerWarnDiff,
        config.healthCheck.bitcoinScannerCriticalDiff,
        BITCOIN_BLOCK_TIME,
      ),
      label: 'bitcoin',
    },
    {
      instance: new ScannerSyncHealthCheckParam(
        scannerService.getDogeScanner().name(),
        async () => getLastSavedBlock(scannerService.getDogeScanner().name()),
        config.healthCheck.dogeScannerWarnDiff,
        config.healthCheck.dogeScannerCriticalDiff,
        DOGE_BLOCK_TIME,
      ),
      label: 'doge',
    },
    {
      instance: new ScannerSyncHealthCheckParam(
        scannerService.getEthereumScanner().name(),
        async () =>
          getLastSavedBlock(scannerService.getEthereumScanner().name()),
        config.healthCheck.ethereumScannerWarnDiff,
        config.healthCheck.ethereumScannerCriticalDiff,
        ETHEREUM_BLOCK_TIME,
      ),
      label: 'ethereum',
    },
    {
      instance: new ScannerSyncHealthCheckParam(
        scannerService.getBinanceScanner().name(),
        async () =>
          getLastSavedBlock(scannerService.getBinanceScanner().name()),
        config.healthCheck.binanceScannerWarnDiff,
        config.healthCheck.binanceScannerCriticalDiff,
        BINANCE_BLOCK_TIME,
      ),
      label: 'binance',
    },
  ];

  for (const { instance, label } of checks) {
    healthCheck.register(instance);
    logger.debug(`${label} scanner-sync-check registered`);
  }
};

/**
 * Initializes and starts the health check service.
 */
const start = async () => {
  try {
    const { notify, notificationConfig } = getNotifySetup();
    const healthCheck = new HealthCheck(notify, notificationConfig);

    const warnLogCheck = new LogLevelHealthCheck(
      CallbackLoggerFactory.getInstance(),
      HealthStatusLevel.UNSTABLE,
      config.healthCheck.warnLogAllowedCount,
      config.healthCheck.logDuration,
      'warn',
    );
    healthCheck.register(warnLogCheck);

    const errorLogCheck = new LogLevelHealthCheck(
      CallbackLoggerFactory.getInstance(),
      HealthStatusLevel.UNSTABLE,
      config.healthCheck.errorLogAllowedCount,
      config.healthCheck.logDuration,
      'error',
    );
    healthCheck.register(errorLogCheck);

    registerAllHealthChecks(healthCheck);

    const interval = config.healthCheck.updateInterval * 1000;
    setInterval(async () => {
      try {
        await healthCheck.update();
        // write health status to the health report file
        const healthStatus = Object.fromEntries(
          healthCheck.getHealthStatus().map((p) => [p.id, p.status]),
        );

        const healthReportPath = path.isAbsolute(config.healthCheck.reportPath)
          ? config.healthCheck.reportPath
          : path.resolve(process.cwd(), config.healthCheck.reportPath);

        fs.writeFileSync(
          healthReportPath,
          JSON.stringify(healthStatus, null, 2),
          'utf8',
        );
        logger.debug('periodic health check update done');
      } catch (e) {
        if (e instanceof AggregateError) {
          logger.warn(
            `Health check update job failed: ${e.errors.map(
              (error) => error.message,
            )}`,
          );
        } else logger.warn(`Health check update job failed: ${e}`);
      }
    }, interval);
  } catch (error) {
    logger.error('failed to start scanner-sync-check', error);
  }
};

const healthCheckService = {
  start,
};

export default healthCheckService;
