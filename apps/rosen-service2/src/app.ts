import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';
import { ServiceManager } from '@rosen-bridge/service-manager';

import dataSource from './data-source';
import { DBService } from './services/db';
import { ErgoScannerService } from './services/ergoScanner';
import { HealthService } from './services/healthCheck';
import { TokensConfig } from './utils';

const logger = CallbackLoggerFactory.getInstance().getLogger(import.meta.url);

/**
 * Main function for running the Rosen-Service2
 *
 * @return
 */
const startApp = async () => {
  const serviceManager = ServiceManager.setup(
    CallbackLoggerFactory.getInstance().getLogger('service-manager'),
  );

  logger.debug('Initializing tokens config instance');
  TokensConfig.init();

  logger.debug('Initializing database service');
  DBService.init(dataSource, logger);
  serviceManager.register(DBService.getInstance());
  logger.debug('Database service registered to the service manager');

  logger.debug('Initializing scanner service');
  await ErgoScannerService.init(
    DBService.getInstance(),
    CallbackLoggerFactory.getInstance().getLogger('ergo-scanner-service'),
  );
  serviceManager.register(ErgoScannerService.getInstance());
  logger.debug('Scanner service registered to the service manager');

  logger.debug('Initializing health service');
  HealthService.init(
    DBService.getInstance(),
    ErgoScannerService.getInstance(),
    CallbackLoggerFactory.getInstance().getLogger('health-check-service'),
  );
  serviceManager.register(HealthService.getInstance());
  logger.debug('Health Service registered to the service manager');

  logger.debug('Starting service manager...');
  serviceManager.start(HealthService.getInstance().getName());

  await Promise.resolve(() => {});
};

export default startApp;
