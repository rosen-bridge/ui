import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';
import WinstonLogger, { TransportOptions } from '@rosen-bridge/winston-logger';
import 'reflect-metadata';

import { configs } from './configs';

CallbackLoggerFactory.init(
  new WinstonLogger(configs.logs as TransportOptions[]),
);
