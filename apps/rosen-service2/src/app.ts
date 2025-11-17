import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';
import { ServiceManager } from '@rosen-bridge/service-manager';

import dataSource from './data-source';
import { AssetDataAdapterService } from './services/assetDataAdapters';
import { DBService } from './services/db';
import { HealthService } from './services/healthCheck';
import { ScannerService } from './services/scanner';
import { TokensConfig } from './tokensConfig';

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
  TokensConfig.init(
    CallbackLoggerFactory.getInstance().getLogger('token-map-config'),
  );

  logger.debug('Initializing database service');
  DBService.init(
    dataSource,
    CallbackLoggerFactory.getInstance().getLogger('db-service'),
  );
  serviceManager.register(DBService.getInstance());
  logger.debug('Database service registered to the service manager');

  logger.debug('Initializing scanner service');
  ScannerService.init(
    CallbackLoggerFactory.getInstance().getLogger('ergo-scanner-service'),
  );
  serviceManager.register(ScannerService.getInstance());
  logger.debug('Scanner service registered to the service manager');

  logger.debug('Initializing asset-data-adapter service');
  AssetDataAdapterService.init(
    CallbackLoggerFactory.getInstance().getLogger('asset-data-adapter-service'),
  );
  serviceManager.register(AssetDataAdapterService.getInstance());
  logger.debug('asset-data-adapter Service registered to the service manager');

  logger.debug('Initializing health-check service');
  HealthService.init(
    CallbackLoggerFactory.getInstance().getLogger('health-check-service'),
  );
  serviceManager.register(HealthService.getInstance());
  logger.debug('Health Service registered to the service manager');

  logger.info('Starting service manager...');
  serviceManager.start(HealthService.getInstance().getName());
  serviceManager.start(AssetDataAdapterService.getInstance().getName());

  await Promise.resolve(() => {});
};

export default startApp;
