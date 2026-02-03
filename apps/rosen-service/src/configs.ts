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

const getOptionalNumber = (path: string): number | undefined => {
  return nodeConfig.has(path) ? nodeConfig.get<number>(path) : undefined;
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
          commitment: nodeConfig.get<string>('ergo.addresses.commitment'),
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
          commitment: nodeConfig.get<string>('cardano.addresses.commitment'),
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
          commitment: nodeConfig.get<string>('bitcoin.addresses.commitment'),
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
      bitcoinRunes: {
        addresses: {
          lock: nodeConfig.get<string>('bitcoin-runes.addresses.lock'),
          eventTrigger: nodeConfig.get<string>(
            'bitcoin-runes.addresses.eventTrigger',
          ),
          permit: nodeConfig.get<string>('bitcoin-runes.addresses.permit'),
          fraud: nodeConfig.get<string>('bitcoin-runes.addresses.fraud'),
          commitment: nodeConfig.get<string>(
            'bitcoin-runes.addresses.commitment',
          ),
        },
        initialHeight: nodeConfig.get<number>('bitcoin-runes.initialHeight'),
        tokens: {
          rwt: nodeConfig.get<string>('bitcoin-runes.tokens.rwt'),
        },
        unisatUrl: nodeConfig.get<string>('bitcoin-runes.unisatUrl'),
        unisatApiKey: nodeConfig.get<string>('bitcoin-runes.unisatApiKey'),
      },
      ethereum: {
        addresses: {
          lock: nodeConfig.get<string>('ethereum.addresses.lock'),
          eventTrigger: nodeConfig.get<string>(
            'ethereum.addresses.eventTrigger',
          ),
          permit: nodeConfig.get<string>('ethereum.addresses.permit'),
          fraud: nodeConfig.get<string>('ethereum.addresses.fraud'),
          commitment: nodeConfig.get<string>('ethereum.addresses.commitment'),
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
          commitment: nodeConfig.get<string>('binance.addresses.commitment'),
        },
        initialHeight: nodeConfig.get<number>('binance.initialHeight'),
        tokens: {
          rwt: nodeConfig.get<string>('binance.tokens.rwt'),
        },
        rpcUrl: nodeConfig.get<string>('binance.rpcUrl'),
        rpcAuthToken: getOptionalString('binance.rpcAuthToken'),
      },
      doge: {
        addresses: {
          lock: nodeConfig.get<string>('doge.addresses.lock'),
          eventTrigger: nodeConfig.get<string>('doge.addresses.eventTrigger'),
          permit: nodeConfig.get<string>('doge.addresses.permit'),
          fraud: nodeConfig.get<string>('doge.addresses.fraud'),
          commitment: nodeConfig.get<string>('doge.addresses.commitment'),
        },
        initialHeight: nodeConfig.get<number>('doge.initialHeight'),
        tokens: {
          rwt: nodeConfig.get<string>('doge.tokens.rwt'),
        },
        blockcypherUrl: nodeConfig.get<string>('doge.blockcypherUrl'),
        rpcConnections: nodeConfig.get<
          Array<{
            url: string;
            username?: string;
            password?: string;
          }>
        >('doge.rpcConnections'),
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
          bitcoinRunes: nodeConfig.get<string[]>(
            'calculator.addresses.bitcoin-runes',
          ),
          ethereum: nodeConfig.get<string[]>('calculator.addresses.ethereum'),
          binance: nodeConfig.get<string[]>('calculator.addresses.binance'),
          doge: nodeConfig.get<string[]>('calculator.addresses.doge'),
        },
        interval: nodeConfig.get<number>('calculator.interval'),
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
        updateInterval: nodeConfig.get<number>('healthCheck.interval'),
        logDuration: nodeConfig.get<number>('healthCheck.duration'),
        errorLogAllowedCount: nodeConfig.get<number>(
          'healthCheck.maxAllowedErrorCount',
        ),
        warnLogAllowedCount: nodeConfig.get<number>(
          'healthCheck.maxAllowedWarnCount',
        ),
        reportPath: nodeConfig.get<string>('healthCheck.reportPath'),
      },
      notification: {
        discordWebHookUrl: nodeConfig.get<string>(
          'notification.discordWebhookUrl',
        ),
        historyCleanupTimeout: getOptionalNumber(
          'notification.historyCleanupTimeout',
        ),
        hasBeenUnstableForAWhileWindowDuration: getOptionalNumber(
          'notification.windowDurations.hasBeenUnstableForAWhile',
        ),
        hasBeenUnknownForAWhileWindowDuration: getOptionalNumber(
          'notification.windowDurations.hasBeenUnknownForAWhile',
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
