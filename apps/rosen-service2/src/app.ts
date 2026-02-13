import { DefaultLogger } from '@rosen-bridge/abstract-logger';
import { ServiceManager } from '@rosen-bridge/service-manager';
import { AssetAggregatorService } from 'services/assetAggregator';

import dataSource from './data-source';
import { AssetDataAdapterService } from './services/assetDataAdapters';
import { DBService } from './services/db';
import { HealthService } from './services/healthCheck';
import { ScannerService } from './services/scanner';
import { TokensConfig } from './tokensConfig';

const logger = DefaultLogger.getInstance().child(import.meta.url);

/**
 * Main function for running the Rosen-Service2
 *
 * @return
 */
const startApp = async () => {
  const serviceManager = ServiceManager.setup(
    DefaultLogger.getInstance().child('service-manager'),
  );

  logger.debug('Initializing tokens config instance');
  TokensConfig.init(DefaultLogger.getInstance().child('token-map-config'));

  logger.debug('Initializing database service');
  DBService.init(dataSource, DefaultLogger.getInstance().child('db-service'));
  serviceManager.register(DBService.getInstance());
  logger.debug('Database service registered to the service manager');

  logger.debug('Initializing scanner service');
  ScannerService.init(
    DefaultLogger.getInstance().child('ergo-scanner-service'),
  );
  serviceManager.register(ScannerService.getInstance());
  logger.debug('Scanner service registered to the service manager');

  logger.debug('Initializing asset-data-adapter service');
  AssetDataAdapterService.init(
    DefaultLogger.getInstance().child('asset-data-adapter-service'),
  );
  serviceManager.register(AssetDataAdapterService.getInstance());
  logger.debug('asset-data-adapter Service registered to the service manager');

  logger.debug('Initializing asset-aggregator service');
  AssetAggregatorService.init(
    DefaultLogger.getInstance().child('asset-aggregator-service'),
  );
  serviceManager.register(AssetAggregatorService.getInstance());
  logger.debug('asset-aggregator Service registered to the service manager');

  logger.debug('Initializing health-check service');
  HealthService.init(DefaultLogger.getInstance().child('health-check-service'));
  serviceManager.register(HealthService.getInstance());
  logger.debug('Health Service registered to the service manager');

  logger.info('Starting service manager...');
  serviceManager.start(HealthService.getInstance().getName());
  serviceManager.start(AssetAggregatorService.getInstance().getName());

  await Promise.resolve(() => {});
};

export default startApp;
