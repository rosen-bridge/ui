import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';
import WinstonLogger from '@rosen-bridge/winston-logger';

import config from '../configs';
import AppError from '../errors/AppError';

try {
  CallbackLoggerFactory.init(new WinstonLogger(config.logs));
} catch (error) {
  throw new AppError(
    `Cannot initialize logger due to error: ${error}`,
    false,
    'error',
    error instanceof Error ? error.stack : undefined,
    config.logs,
  );
}
