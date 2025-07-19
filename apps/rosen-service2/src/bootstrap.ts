import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';
import WinstonLogger from '@rosen-bridge/winston-logger';
import 'reflect-metadata';

import { configs, getLogOptions } from './configs';

CallbackLoggerFactory.init(new WinstonLogger(getLogOptions(configs)));
