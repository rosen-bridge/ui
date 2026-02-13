import { DefaultLogger } from '@rosen-bridge/abstract-logger';
import CallbackLogger from '@rosen-bridge/callback-logger';
import WinstonLogger from '@rosen-bridge/winston-logger';
import 'reflect-metadata';

import { configs, getLogOptions } from './configs';

DefaultLogger.init(
  new CallbackLogger(WinstonLogger.createLogger(getLogOptions(configs.logs))),
);
