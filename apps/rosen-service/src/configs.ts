import { TransportOptions } from '@rosen-bridge/winston-logger';
import nodeConfig from 'config';

import AppError from './errors/AppError';

/**
 * Checks the config path and return the configuration if it exists
 * @param path
 * @returns
 */
const getOptionalString = (path: string): string | undefined => {
  return nodeConfig.has(path) ? nodeConfig.get<string>(path) : undefined;
};

const getConfig = () => {
  try {
    return {
      logs: nodeConfig.get<TransportOptions[]>('logs'),
      ergo: {
        addresses: {
          lock: nodeConfig.get<string>('ergo.addresses.lock'),
          eventTrigger: nodeConfig.get<string>('ergo.addresses.eventTrigger'),
          permit: nodeConfig.get<string>('ergo.addresses.permit'),
          fraud: nodeConfig.get<string>('ergo.addresses.fraud'),
        },
        initialHeight: nodeConfig.get<number>('ergo.initialHeight'),
        tokens: {
          rwt: nodeConfig.get<string>('ergo.tokens.rwt'),
        },
        explorerUrl: nodeConfig.get<string>('ergo.explorerUrl'),
      },
      cardano: {
        addresses: {
          lock: nodeConfig.get<string>('cardano.addresses.lock'),
          eventTrigger: nodeConfig.get<string>(
            'cardano.addresses.eventTrigger',
          ),
          permit: nodeConfig.get<string>('cardano.addresses.permit'),
          fraud: nodeConfig.get<string>('cardano.addresses.fraud'),
        },
        initialHeight: nodeConfig.get<number>('cardano.initialHeight'),
        tokens: {
          rwt: nodeConfig.get<string>('cardano.tokens.rwt'),
        },
        koiosUrl: nodeConfig.get<string>('cardano.koiosUrl'),
        koiosAuthToken: nodeConfig.get<string>('cardano.koiosAuthToken'),
      },
      bitcoin: {
        addresses: {
          lock: nodeConfig.get<string>('bitcoin.addresses.lock'),
          eventTrigger: nodeConfig.get<string>(
            'bitcoin.addresses.eventTrigger',
          ),
          permit: nodeConfig.get<string>('bitcoin.addresses.permit'),
          fraud: nodeConfig.get<string>('bitcoin.addresses.fraud'),
        },
        initialHeight: nodeConfig.get<number>('bitcoin.initialHeight'),
        tokens: {
          rwt: nodeConfig.get<string>('bitcoin.tokens.rwt'),
        },
        esploraUrl: nodeConfig.get<string>('bitcoin.esploraUrl'),
        rpcUrl: nodeConfig.get<string>('bitcoin.rpc.url'),
        rpcUsername: getOptionalString('bitcoin.rpc.username'),
        rpcPassword: getOptionalString('bitcoin.rpc.password'),
      },
      ethereum: {
        addresses: {
          lock: nodeConfig.get<string>('ethereum.addresses.lock'),
          eventTrigger: nodeConfig.get<string>(
            'ethereum.addresses.eventTrigger',
          ),
          permit: nodeConfig.get<string>('ethereum.addresses.permit'),
          fraud: nodeConfig.get<string>('ethereum.addresses.fraud'),
        },
        initialHeight: nodeConfig.get<number>('ethereum.initialHeight'),
        tokens: {
          rwt: nodeConfig.get<string>('ethereum.tokens.rwt'),
        },
        rpcUrl: nodeConfig.get<string>('ethereum.rpcUrl'),
        rpcAuthToken: getOptionalString('ethereum.rpcAuthToken'),
      },
      binance: {
        addresses: {
          lock: nodeConfig.get<string>('binance.addresses.lock'),
          eventTrigger: nodeConfig.get<string>(
            'binance.addresses.eventTrigger',
          ),
          permit: nodeConfig.get<string>('binance.addresses.permit'),
          fraud: nodeConfig.get<string>('binance.addresses.fraud'),
        },
        initialHeight: nodeConfig.get<number>('binance.initialHeight'),
        tokens: {
          rwt: nodeConfig.get<string>('binance.tokens.rwt'),
        },
        rpcUrl: nodeConfig.get<string>('binance.rpcUrl'),
        rpcAuthToken: getOptionalString('binance.rpcAuthToken'),
      },
      postgres: {
        url: nodeConfig.get<string>('postgres.url'),
        logging: nodeConfig.get<boolean>('postgres.logging'),
        useSSL: nodeConfig.get<boolean>('postgres.useSSL'),
      },
      calculator: {
        addresses: {
          ergo: nodeConfig.get<string[]>('calculator.addresses.ergo'),
          cardano: nodeConfig.get<string[]>('calculator.addresses.cardano'),
          bitcoin: nodeConfig.get<string[]>('calculator.addresses.bitcoin'),
          ethereum: nodeConfig.get<string[]>('calculator.addresses.ethereum'),
          binance: nodeConfig.get<string[]>('calculator.addresses.binance'),
        },
      },
      healthCheck: {
        ergoScannerWarnDiff: nodeConfig.get<number>(
          'healthCheck.ergoScannerWarnDiff',
        ),
        ergoScannerCriticalDiff: nodeConfig.get<number>(
          'healthCheck.ergoScannerCriticalDiff',
        ),
        cardanoScannerWarnDiff: nodeConfig.get<number>(
          'healthCheck.cardanoScannerWarnDiff',
        ),
        cardanoScannerCriticalDiff: nodeConfig.get<number>(
          'healthCheck.cardanoScannerCriticalDiff',
        ),
        bitcoinScannerWarnDiff: nodeConfig.get<number>(
          'healthCheck.bitcoinScannerWarnDiff',
        ),
        bitcoinScannerCriticalDiff: nodeConfig.get<number>(
          'healthCheck.bitcoinScannerCriticalDiff',
        ),
        dogeScannerWarnDiff: nodeConfig.get<number>(
          'healthCheck.dogeScannerWarnDiff',
        ),
        dogeScannerCriticalDiff: nodeConfig.get<number>(
          'healthCheck.dogeScannerCriticalDiff',
        ),
        ethereumScannerWarnDiff: nodeConfig.get<number>(
          'healthCheck.ethereumScannerWarnDiff',
        ),
        ethereumScannerCriticalDiff: nodeConfig.get<number>(
          'healthCheck.ethereumScannerCriticalDiff',
        ),
        binanceScannerWarnDiff: nodeConfig.get<number>(
          'healthCheck.binanceScannerWarnDiff',
        ),
        binanceScannerCriticalDiff: nodeConfig.get<number>(
          'healthCheck.binanceScannerCriticalDiff',
        ),
        ergoNodeMaxHeightDiff: nodeConfig.get<number>(
          'healthCheck.ergoNodeMaxHeightDiff',
        ),
        ergoNodeMaxBlockTime: nodeConfig.get<number>(
          'healthCheck.ergoNodeMaxBlockTime',
        ),
        ergoNodeMinPeerCount: nodeConfig.get<number>(
          'healthCheck.ergoNodeMinPeerCount',
        ),
        ergoNodeMaxPeerHeightDifference: nodeConfig.get<number>(
          'healthCheck.ergoNodeMaxPeerHeightDifference',
        ),
        updateInterval: nodeConfig.get<number>('healthCheck.updateInterval'),
        logDuration: nodeConfig.get<number>('healthCheck.logDuration'),
        errorLogAllowedCount: nodeConfig.get<number>(
          'healthCheck.errorLogAllowedCount',
        ),
        warnLogAllowedCount: nodeConfig.get<number>(
          'healthCheck.warnLogAllowedCount',
        ),
      },
      notification: {
        discordWebHookUrl: nodeConfig.get<string>(
          'notification.discordWebhookUrl',
        ),
        historyCleanupTimeout: nodeConfig.get<number>(
          'notification.historyCleanupTimeout',
        ),
        hasBeenUnstableForAWhileWindowDuration: nodeConfig.get<number>(
          'notification.windowDurations.hasBeenUnstableForAWhile',
        ),
        hasBeenUnknownForAWhileWindowDuration: nodeConfig.get<number>(
          'notification.windowDurations.hasBeenUnknownForAWhile',
        ),
        isStillUnhealthyWindowDuration: nodeConfig.get<number>(
          'notification.windowDurations.isStillUnhealthy',
        ),
      },
    };
  } catch (error) {
    throw new AppError(
      `an error occurred reading some service configs: ${error}`,
      false,
      'error',
      error instanceof Error ? error.stack : undefined,
    );
  }
};

const config = getConfig();

export default config;
