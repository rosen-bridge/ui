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
 * start all scanner-health-check and register their in a healthCheck with DiscordNotification
 */
const start = async () => {
  let notify;
  let notificationConfig;
  if (config.notification.discordWebHookUrl) {
    const discordNotification = new DiscordNotification(
      config.notification.discordWebHookUrl,
    );
    notify = discordNotification.notify;
    notificationConfig = {
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
  }
  try {
    const healthCheck = new HealthCheck(notify, notificationConfig);
    const ergoNodeCheck = new ErgoExplorerScannerHealthCheck(
      () => getLastSavedBlock(startErgoScanner.name),
      config.healthCheck.ergoScannerWarnDiff,
      config.healthCheck.ergoScannerCriticalDiff,
      config.ergo.explorerUrl,
    );
    healthCheck.register(ergoNodeCheck);
    logger.debug('ergo scanner-sync-checks registered');
    const cardanoScannerSyncCheck = new CardanoKoiosScannerHealthCheck(
      () => getLastSavedBlock(startCardanoScanner.name),
      config.healthCheck.cardanoScannerWarnDiff,
      config.healthCheck.cardanoScannerCriticalDiff,
      config.cardano.koiosUrl,
      config.cardano.koiosAuthToken,
    );
    healthCheck.register(cardanoScannerSyncCheck);
    logger.debug('cardano scanner-sync-checks registered');
    const bitcoinScannerSyncCheck = new BitcoinRPCScannerHealthCheck(
      () => getLastSavedBlock(startBinanceScanner.name),
      config.healthCheck.bitcoinScannerWarnDiff,
      config.healthCheck.bitcoinScannerCriticalDiff,
      config.bitcoin.rpcUrl,
      config.bitcoin.rpcUsername,
      config.bitcoin.rpcPassword,
    );
    healthCheck.register(bitcoinScannerSyncCheck);
    logger.debug('bitcoin scanner-sync-checks registered');
    const ethereumRpcScannerSyncCheck = new EvmRPCScannerHealthCheck(
      ETHEREUM_CHAIN_NAME,
      () => getLastSavedBlock(startEthereumScanner.name),
      config.healthCheck.ethereumScannerWarnDiff,
      config.healthCheck.ethereumScannerCriticalDiff,
      config.ethereum.rpcUrl,
      ETHEREUM_BLOCK_TIME,
      config.ethereum.rpcAuthToken,
    );
    logger.debug('ethereum scanner-sync-checks registered');
    healthCheck.register(ethereumRpcScannerSyncCheck);
    const binanceRpcScannerSyncCheck = new EvmRPCScannerHealthCheck(
      BINANCE_CHAIN_NAME,
      () => getLastSavedBlock(startBinanceScanner.name),
      config.healthCheck.binanceScannerWarnDiff,
      config.healthCheck.binanceScannerCriticalDiff,
      config.binance.rpcUrl,
      BINANCE_BLOCK_TIME,
      config.binance.rpcAuthToken,
    );
    healthCheck.register(binanceRpcScannerSyncCheck);
    logger.debug('binance scanner-sync-checks registered');
  } catch (error) {
    logger.error('failed to start scanner-sync-check', error);
  }
};

export default { start };
