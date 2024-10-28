import Logger from '@rosen-bridge/winston-logger';

const logger = new Logger([
  {
    type: 'loki',
    host: 'http://10.10.9.99:3100',
    level: 'debug',
    serviceName: 'rosen-app-ui-test-02',
  },
]);

logger.getLogger('INIT_FILE').info('INIT');

export { logger };
