import { DiscordNotification } from '@rosen-bridge/discord-notification';
import { HealthCheck } from '@rosen-bridge/health-check';
import {
  CardanoKoiosScannerHealthCheck,
  ErgoExplorerScannerHealthCheck,
  BitcoinRPCScannerHealthCheck,
  EvmRPCScannerHealthCheck,
} from '@rosen-bridge/scanner-sync-check';
import WinstonLogger from '@rosen-bridge/winston-logger/dist/WinstonLogger';
import config from 'src/configs';
import {
  BINANCE_BLOCK_TIME,
  BINANCE_CHAIN_NAME,
  ETHEREUM_BLOCK_TIME,
  ETHEREUM_CHAIN_NAME,
} from 'src/constants';
import { startBinanceScanner } from 'src/scanner/chains/binance';
import { startCardanoScanner } from 'src/scanner/chains/cardano';
import { startErgoScanner } from 'src/scanner/chains/ergo';
import { startEthereumScanner } from 'src/scanner/chains/ethereum';

import { getLastSavedBlock } from './health-check-utils';

const logger = WinstonLogger.getInstance().getLogger(import.meta.url);

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
        () => getLastSavedBlock(startErgoScanner.name),
        config.healthCheck.ergoScannerWarnDiff,
        config.healthCheck.ergoScannerCriticalDiff,
        config.ergo.explorerUrl,
      ),
      label: 'ergo',
    },
    {
      instance: new CardanoKoiosScannerHealthCheck(
        () => getLastSavedBlock(startCardanoScanner.name),
        config.healthCheck.cardanoScannerWarnDiff,
        config.healthCheck.cardanoScannerCriticalDiff,
        config.cardano.koiosUrl,
        config.cardano.koiosAuthToken,
      ),
      label: 'cardano',
    },
    {
      instance: new BitcoinRPCScannerHealthCheck(
        () => getLastSavedBlock(startBinanceScanner.name),
        config.healthCheck.bitcoinScannerWarnDiff,
        config.healthCheck.bitcoinScannerCriticalDiff,
        config.bitcoin.rpcUrl,
        config.bitcoin.rpcUsername,
        config.bitcoin.rpcPassword,
      ),
      label: 'bitcoin',
    },
    {
      instance: new EvmRPCScannerHealthCheck(
        ETHEREUM_CHAIN_NAME,
        () => getLastSavedBlock(startEthereumScanner.name),
        config.healthCheck.ethereumScannerWarnDiff,
        config.healthCheck.ethereumScannerCriticalDiff,
        config.ethereum.rpcUrl,
        ETHEREUM_BLOCK_TIME,
        config.ethereum.rpcAuthToken,
      ),
      label: 'ethereum',
    },
    {
      instance: new EvmRPCScannerHealthCheck(
        BINANCE_CHAIN_NAME,
        () => getLastSavedBlock(startBinanceScanner.name),
        config.healthCheck.binanceScannerWarnDiff,
        config.healthCheck.binanceScannerCriticalDiff,
        config.binance.rpcUrl,
        BINANCE_BLOCK_TIME,
        config.binance.rpcAuthToken,
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

    try {
      await healthCheck.update();
      logger.debug('first health check update successfully');
    } catch (error) {
      logger.debug('health check update has error', error);
    }

    const interval = config.healthCheck.updateInterval * 1000;
    setInterval(async () => {
      try {
        await healthCheck.update();
        logger.debug('periodic health check update done');
      } catch (error) {
        logger.debug('periodic health check update error', error);
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
