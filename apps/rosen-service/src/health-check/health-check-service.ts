import { DiscordNotification } from '@rosen-bridge/discord-notification';
import { HealthCheck } from '@rosen-bridge/health-check';
import {
  ErgoScanner,
  CardanoKoiosScanner,
  CardanoOgmiosScanner,
} from '@rosen-bridge/scanner';
import {
  CardanoKoiosScannerHealthCheck,
  CardanoOgmiosScannerHealthCheck,
  ErgoExplorerScannerHealthCheck,
  ErgoNodeScannerHealthCheck,
  BitcoinEsploraScannerHealthCheck,
  BitcoinRPCScannerHealthCheck,
  EvmRPCScannerHealthCheck,
} from '@rosen-bridge/scanner-sync-check';
import WinstonLogger from '@rosen-bridge/winston-logger/dist/WinstonLogger';
import config from 'src/configs';

import { getLastSavedBlock } from './health-check-utils';

const logger = WinstonLogger.getInstance().getLogger(import.meta.url);

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
      () => getLastSavedBlock(ErgoScanner.name),
      config.healthCheck.ergoScannerWarnDiff,
      config.healthCheck.ergoScannerCriticalDiff,
      config.ergo.explorerUrl,
    );
    healthCheck.register(ergoNodeCheck);
    logger.debug('scanner-sync-checks registered');
  } catch (error) {
    logger.error('failed to start scanner-sync-check', error);
  }
};

export default { start };
