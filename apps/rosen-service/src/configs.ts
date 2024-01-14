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
        koiosAuthToken: nodeConfig.get<string>('cardano.koiosAuthToken'),
      },
      postgres: {
        url: nodeConfig.get<string>('postgres.url'),
        logging: nodeConfig.get<boolean>('postgres.logging'),
        useSSL: nodeConfig.get<boolean>('postgres.useSSL'),
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
