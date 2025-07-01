import WinstonLogger from '@rosen-bridge/winston-logger';
import 'reflect-metadata';

import { maxLogSize, maxLogFilesCount, logsPath, logLevel } from './configs';

await WinstonLogger.init([
  {
    type: 'file',
    maxSize: maxLogSize,
    maxFiles: maxLogFilesCount,
    path: logsPath,
    level: logLevel,
  },
]);
