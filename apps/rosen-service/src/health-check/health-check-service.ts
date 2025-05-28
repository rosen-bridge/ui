import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';
import { DiscordNotification } from '@rosen-bridge/discord-notification';
import { HealthCheck } from '@rosen-bridge/health-check';
import {
  CardanoKoiosScannerHealthCheck,
  ErgoExplorerScannerHealthCheck,
  BitcoinRPCScannerHealthCheck,
  EvmRPCScannerHealthCheck,
} from '@rosen-bridge/scanner-sync-check';
import { NETWORKS } from '@rosen-ui/constants';

import config from '../configs';
import { BINANCE_BLOCK_TIME, ETHEREUM_BLOCK_TIME } from '../constants';
import { startBinanceScanner } from '../scanner/chains/binance';
import { startCardanoScanner } from '../scanner/chains/cardano';
import { startErgoScanner } from '../scanner/chains/ergo';
import { startEthereumScanner } from '../scanner/chains/ethereum';
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
        async () => getLastSavedBlock((await startErgoScanner()).name()),
        config.healthCheck.ergoScannerWarnDiff,
        config.healthCheck.ergoScannerCriticalDiff,
      ),
      label: 'ergo',
    },
    {
      instance: new CardanoKoiosScannerHealthCheck(
        scannerService.getCardanoScanner().getBlockChainLastHeight,
        async () => getLastSavedBlock((await startCardanoScanner()).name()),
        config.healthCheck.cardanoScannerWarnDiff,
        config.healthCheck.cardanoScannerCriticalDiff,
      ),
      label: 'cardano',
    },
    {
      instance: new BitcoinRPCScannerHealthCheck(
        NETWORKS.bitcoin.key,
        scannerService.getBitcoinScanner().getBlockChainLastHeight,
        async () => getLastSavedBlock((await startBinanceScanner()).name()),
        config.healthCheck.bitcoinScannerWarnDiff,
        config.healthCheck.bitcoinScannerCriticalDiff,
      ),
      label: 'bitcoin',
    },
    {
      instance: new BitcoinRPCScannerHealthCheck(
        NETWORKS.doge.key,
        scannerService.getDogeScanner().getBlockChainLastHeight,
        async () => getLastSavedBlock((await startBinanceScanner()).name()),
        config.healthCheck.dogeScannerWarnDiff,
        config.healthCheck.dogeScannerCriticalDiff,
      ),
      label: 'doge',
    },
    {
      instance: new EvmRPCScannerHealthCheck(
        NETWORKS.ethereum.key,
        scannerService.getEthereumScanner().getBlockChainLastHeight,
        async () => getLastSavedBlock((await startEthereumScanner()).name()),
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
        async () => getLastSavedBlock((await startBinanceScanner()).name()),
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

    registerAllHealthChecks(healthCheck);

    const interval = config.healthCheck.updateInterval * 1000;
    setInterval(async () => {
      try {
        await healthCheck.update();
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
