import { DefaultLogger } from '@rosen-bridge/abstract-logger';
import CallbackLogger from '@rosen-bridge/callback-logger';
import WinstonLogger from '@rosen-bridge/winston-logger';

import config from '../configs';
import AppError from '../errors/AppError';

try {
  DefaultLogger.init(
    new CallbackLogger(WinstonLogger.createLogger(config.logs)),
  );
} catch (error) {
  throw new AppError(
    `Cannot initialize logger due to error: ${error}`,
    false,
    'error',
    error instanceof Error ? error.stack : undefined,
    config.logs,
  );
}
