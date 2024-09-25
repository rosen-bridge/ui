import nodeConfig from 'config';

import { TransportOptions } from '@rosen-bridge/winston-logger';

import AppError from './errors/AppError';

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
            'cardano.addresses.eventTrigger'
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
            'bitcoin.addresses.eventTrigger'
          ),
          permit: nodeConfig.get<string>('bitcoin.addresses.permit'),
          fraud: nodeConfig.get<string>('bitcoin.addresses.fraud'),
        },
        initialHeight: nodeConfig.get<number>('bitcoin.initialHeight'),
        tokens: {
          rwt: nodeConfig.get<string>('bitcoin.tokens.rwt'),
        },
        esploraUrl: nodeConfig.get<string>('bitcoin.esploraUrl'),
      },
      ethereum: {
        addresses: {
          lock: nodeConfig.get<string>('ethereum.addresses.lock'),
          eventTrigger: nodeConfig.get<string>(
            'ethereum.addresses.eventTrigger'
          ),
          permit: nodeConfig.get<string>('ethereum.addresses.permit'),
          fraud: nodeConfig.get<string>('ethereum.addresses.fraud'),
        },
        initialHeight: nodeConfig.get<number>('ethereum.initialHeight'),
        tokens: {
          rwt: nodeConfig.get<string>('ethereum.tokens.rwt'),
        },
        rpcUrl: nodeConfig.get<string>('ethereum.rpcUrl'),
        rpcAuthToken: nodeConfig.get<string>('ethereum.rpcAuthToken'),
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
        },
      },
    };
  } catch (error) {
    throw new AppError(
      `an error occurred reading some service configs: ${error}`,
      false,
      'error',
      error instanceof Error ? error.stack : undefined
    );
  }
};

const config = getConfig();

export default config;
