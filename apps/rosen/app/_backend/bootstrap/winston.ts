import WinstonLogger from '@rosen-bridge/winston-logger';

WinstonLogger.init([
  {
    type: 'console',
    level: process.env.CONSOLE_LOG_LEVEL || 'info',
  },
  {
    type: 'file',
    level: process.env.FILE_LOG_LEVEL || 'debug',
    path: process.env.FILE_LOG_PATH || './logs/log',
    maxSize: process.env.FILE_LOG_MAX_SIZE || '10M',
    maxFiles: process.env.FILE_LOG_MAX_FILES || '14d',
  },
]);
