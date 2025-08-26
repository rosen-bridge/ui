import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';
import { ServiceManager } from '@rosen-bridge/service-manager';

import dataSource from './data-source';
import { ChainsHealthCheckService } from './services/chainsHealthCheck';
import { ChainsScannerService } from './services/chainsScanners';
import { DBService } from './services/db';
import { ErgoScannerService } from './services/ergoScanner';
import { HealthService } from './services/healthCheck';
import { TokensConfig } from './tokensConfig';

const loggerFactory = CallbackLoggerFactory.getInstance();
const logger = loggerFactory.getLogger(import.meta.url);

/**
 * Main function for running the Rosen-Service2
 *
 * @return
 */
const startApp = async () => {
  const serviceManager = ServiceManager.setup(
    loggerFactory.getLogger('service-manager'),
  );

  logger.debug('Initializing tokens config instance');
  TokensConfig.init(loggerFactory.getLogger('token-map-config'));

  logger.debug('Initializing database service');
  DBService.init(dataSource, loggerFactory.getLogger('db-service'));
  serviceManager.register(DBService.getInstance());
  logger.debug('Database service registered to the service manager');

  logger.debug('Initializing scanner service');
  await ErgoScannerService.init(
    loggerFactory.getLogger('ergo-scanner-service'),
  );
  serviceManager.register(ErgoScannerService.getInstance());
  logger.debug('Scanner service registered to the service manager');

  logger.debug('Initializing health-check service');
  HealthService.init(loggerFactory.getLogger('health-check-service'));
  serviceManager.register(HealthService.getInstance());
  logger.debug('Health Service registered to the service manager');

  logger.debug('Initializing chains scanners service');
  await ChainsScannerService.init(
    loggerFactory.getLogger('chains-scanner-service'),
  );
  serviceManager.register(ChainsScannerService.getInstance());
  logger.debug('chains scanners Service registered to the service manager');

  logger.debug('Initializing chains health-check service');
  ChainsHealthCheckService.init(
    loggerFactory.getLogger('chains-health-check-service'),
  );
  serviceManager.register(ChainsHealthCheckService.getInstance());
  logger.debug('chains health-check Service registered to the service manager');

  logger.info('Starting service manager...');
  serviceManager.start(ChainsHealthCheckService.getInstance().getName());

  await Promise.resolve(() => {});
};

export default startApp;
