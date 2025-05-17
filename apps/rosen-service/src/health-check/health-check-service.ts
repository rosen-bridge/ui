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
        async () => getLastSavedBlock((await startErgoScanner()).name()),
        config.healthCheck.ergoScannerWarnDiff,
        config.healthCheck.ergoScannerCriticalDiff,
        config.ergo.explorerUrl,
      ),
      label: 'ergo',
    },
    {
      instance: new CardanoKoiosScannerHealthCheck(
        async () => getLastSavedBlock((await startCardanoScanner()).name()),
        config.healthCheck.cardanoScannerWarnDiff,
        config.healthCheck.cardanoScannerCriticalDiff,
        config.cardano.koiosUrl,
        config.cardano.koiosAuthToken,
      ),
      label: 'cardano',
    },
    {
      instance: new BitcoinRPCScannerHealthCheck(
        async () => getLastSavedBlock((await startBinanceScanner()).name()),
        config.healthCheck.bitcoinScannerWarnDiff,
        config.healthCheck.bitcoinScannerCriticalDiff,
        config.bitcoin.rpcUrl,
        config.bitcoin.rpcUsername,
        config.bitcoin.rpcPassword,
      ),
      label: 'bitcoin',
    },
    {
      instance: new BitcoinRPCScannerHealthCheck(
        async () => getLastSavedBlock((await startBinanceScanner()).name()),
        config.healthCheck.dogeScannerWarnDiff,
        config.healthCheck.dogeScannerCriticalDiff,
        config.doge.rpcConnections[0].url,
        config.doge.rpcConnections[0].username,
        config.doge.rpcConnections[0].password,
      ),
      label: 'doge',
    },
    {
      instance: new EvmRPCScannerHealthCheck(
        NETWORKS.ethereum.key,
        async () => getLastSavedBlock((await startEthereumScanner()).name()),
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
        NETWORKS.binance.key,
        async () => getLastSavedBlock((await startBinanceScanner()).name()),
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
