import WinstonLogger, { TransportOptions } from '@rosen-bridge/winston-logger';
import 'reflect-metadata';

import { configs } from './configs';

await WinstonLogger.init(configs.logs as TransportOptions[]);
