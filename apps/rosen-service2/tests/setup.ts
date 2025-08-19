import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';
import WinstonLogger from '@rosen-bridge/winston-logger';
import 'reflect-metadata';

CallbackLoggerFactory.init(
  new WinstonLogger([
    {
      type: 'console',
      level: 'debug',
    },
  ]),
);
