import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';
import { DiscordNotification } from '@rosen-bridge/discord-notification';
import { HealthCheck, HealthStatusLevel } from '@rosen-bridge/health-check';
import { LogLevelHealthCheck } from '@rosen-bridge/log-level-check';
import {
  CardanoKoiosScannerHealthCheck,
  ErgoExplorerScannerHealthCheck,
  BitcoinRPCScannerHealthCheck,
  EvmRPCScannerHealthCheck,
} from '@rosen-bridge/scanner-sync-check';
import { NETWORKS } from '@rosen-ui/constants';
import fs from 'node:fs';
import path from 'node:path';

import config from '../configs';
import {
  BINANCE_BLOCK_TIME,
  DOGE_BLOCK_TIME,
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
      instance: new ErgoExplorerScannerHealthCheck(
        scannerService.getErgoScanner().getBlockChainLastHeight,
        async () => getLastSavedBlock(scannerService.getErgoScanner().name()),
        config.healthCheck.ergoScannerWarnDiff,
        config.healthCheck.ergoScannerCriticalDiff,
      ),
      label: 'ergo',
    },
    {
      instance: new CardanoKoiosScannerHealthCheck(
        scannerService.getCardanoScanner().getBlockChainLastHeight,
        async () =>
          getLastSavedBlock(scannerService.getCardanoScanner().name()),
        config.healthCheck.cardanoScannerWarnDiff,
        config.healthCheck.cardanoScannerCriticalDiff,
      ),
      label: 'cardano',
    },
    {
      instance: new BitcoinRPCScannerHealthCheck(
        NETWORKS.bitcoin.key,
        scannerService.getBitcoinScanner().getBlockChainLastHeight,
        async () =>
          getLastSavedBlock(scannerService.getBitcoinScanner().name()),
        config.healthCheck.bitcoinScannerWarnDiff,
        config.healthCheck.bitcoinScannerCriticalDiff,
      ),
      label: 'bitcoin',
    },
    {
      instance: new BitcoinRPCScannerHealthCheck(
        NETWORKS.doge.key,
        scannerService.getDogeScanner().getBlockChainLastHeight,
        async () => getLastSavedBlock(scannerService.getDogeScanner().name()),
        config.healthCheck.dogeScannerWarnDiff,
        config.healthCheck.dogeScannerCriticalDiff,
        undefined, // to use the default warn block gap
        undefined, // to use the default critical block gap
        DOGE_BLOCK_TIME,
      ),
      label: 'doge',
    },
    {
      instance: new EvmRPCScannerHealthCheck(
        NETWORKS.ethereum.key,
        scannerService.getEthereumScanner().getBlockChainLastHeight,
        async () =>
          getLastSavedBlock(scannerService.getEthereumScanner().name()),
        config.healthCheck.ethereumScannerWarnDiff,
        config.healthCheck.ethereumScannerCriticalDiff,
        ETHEREUM_BLOCK_TIME,
      ),
      label: 'ethereum',
    },
    {
      instance: new EvmRPCScannerHealthCheck(
        NETWORKS.binance.key,
        scannerService.getBinanceScanner().getBlockChainLastHeight,
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
        // write health status to the healthPatch config address
        const healthStatus: { [k: string]: string } = {};
        healthCheck
          .getHealthStatus()
          .forEach((p) => (healthStatus[p.id] = p.status));
        let healthReportPath = config.healthCheck.reportPath;
        if (!path.isAbsolute(healthReportPath)) {
          healthReportPath = path.resolve(process.cwd(), healthReportPath);
        }
        fs.writeFileSync(
          healthReportPath,
          JSON.stringify(healthStatus, undefined, 4),
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
