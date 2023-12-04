import nodeConfig from 'config';

import { TransportOptions } from '@rosen-bridge/winston-logger';

const config = {
  logs: nodeConfig.get<TransportOptions[]>('logs'),
  ergo: {
    lockAddress: nodeConfig.get<string>('ergo.lockAddress'),
    initialHeight: nodeConfig.get<number>('ergo.initialHeight'),
  },
  cardano: {
    lockAddress: nodeConfig.get<string>('cardano.lockAddress'),
    initialHeight: nodeConfig.get<number>('cardano.initialHeight'),
  },
  postgres: {
    url: nodeConfig.get<string>('postgres.url'),
    logging: nodeConfig.get<boolean>('postgres.logging'),
    useSSL: nodeConfig.get<boolean>('postgres.useSSL'),
  },
};

export default config;
