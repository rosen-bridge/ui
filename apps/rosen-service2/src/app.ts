import { DefaultLogger } from '@rosen-bridge/abstract-logger';
import { ServiceManager } from '@rosen-bridge/service-manager';
import { AbstractErgoExtractorsService } from 'services/types/abstractErgoExtractor';

import dataSource from './data-source';
import { AssetAggregatorService } from './services/assetAggregator';
import { AssetDataAdapterService } from './services/assetDataAdapters';
import { DBService } from './services/db';
import { ErgoExtractorService } from './services/ergoExtractor';
import { ErgoScannerService } from './services/ergoScanner';
import { EventCountMetricService } from './services/eventCountMetric';
import { GeneralMetricsService } from './services/generalMetrics';
import { HealthService } from './services/healthCheck';
import { LockedAssetsMetricService } from './services/lockedAssetsMetric';
import { ScannerService } from './services/scanner';
import { TokenMapService } from './services/tokenMap';
import { UserEventsMetricService } from './services/userEventsMetric';

const logger = DefaultLogger.getInstance().child(import.meta.url);

/**
 * Main function for running the Rosen-Service2
 *
 * @return
 */
const startApp = async () => {
  const serviceManager = ServiceManager.setup(
    DefaultLogger.getInstance().child('serviceManager'),
  );
  logger.debug('Initializing database service');
  DBService.init(dataSource, DefaultLogger.getInstance().child('dbService'));
  serviceManager.register(DBService.getInstance());
  logger.debug('Database service registered to the service manager');
  logger.debug('Initializing ergo scanner service');
  await ErgoScannerService.init(
    DefaultLogger.getInstance().child('ErgoScannerService'),
  );
  serviceManager.register(ErgoScannerService.getInstance());
  logger.debug('ergoScanner service registered to the service manager');
  logger.debug('Initializing tokenMap scanner service');
  await TokenMapService.init(
    DefaultLogger.getInstance().child('TokenMapService'),
  );
  serviceManager.register(TokenMapService.getInstance());
  logger.debug('tokenMap service registered to the service manager');
  logger.debug('Initializing ergo extractor scanner service');
  await ErgoExtractorService.init(
    DefaultLogger.getInstance().child('ErgoExtractorService'),
  );
  serviceManager.register(AbstractErgoExtractorsService.getInstance());
  logger.debug('ergoExtractor service registered to the service manager');
  logger.debug('Initializing scanner service');
  ScannerService.init(DefaultLogger.getInstance().child('ergoScannerService'));
  serviceManager.register(ScannerService.getInstance());
  logger.debug('Scanner service registered to the service manager');
  logger.debug('Initializing general metrics service');
  GeneralMetricsService.init(
    DefaultLogger.getInstance().child('generalMetricsService'),
  );
  serviceManager.register(GeneralMetricsService.getInstance());
  logger.debug('General metrics service registered to the service manager');

  logger.debug('Initializing general metrics service');
  GeneralMetricsService.init(
    DefaultLogger.getInstance().child('generalMetricsService'),
  );
  serviceManager.register(GeneralMetricsService.getInstance());
  logger.debug('General metrics service registered to the service manager');

  logger.debug('Initializing asset-data-adapter service');
  AssetDataAdapterService.init(
    DefaultLogger.getInstance().child('assetDataAdapterService'),
  );
  serviceManager.register(AssetDataAdapterService.getInstance());
  logger.debug('asset-data-adapter Service registered to the service manager');

  logger.debug('Initializing asset-aggregator service');
  AssetAggregatorService.init(
    DefaultLogger.getInstance().child('assetAggregatorService'),
  );
  serviceManager.register(AssetAggregatorService.getInstance());
  logger.debug('asset-aggregator Service registered to the service manager');

  logger.debug('Initializing locked assets metrics service');
  LockedAssetsMetricService.init(
    DefaultLogger.getInstance().child('lockedAssetsMetricsService'),
  );
  serviceManager.register(LockedAssetsMetricService.getInstance());
  logger.debug(
    'Locked assets metrics service registered to the service manager',
  );

  logger.debug('Initializing event count metrics service');
  EventCountMetricService.init(
    DefaultLogger.getInstance().child('eventCountMetricsService'),
  );
  serviceManager.register(EventCountMetricService.getInstance());
  logger.debug('Event count metrics service registered to the service manager');

  logger.debug('Initializing user events metrics service');
  UserEventsMetricService.init(
    DefaultLogger.getInstance().child('userEventsMetricService'),
  );
  serviceManager.register(UserEventsMetricService.getInstance());
  logger.debug('User events metrics service registered to the service manager');

  logger.debug('Initializing health-check service');
  HealthService.init(DefaultLogger.getInstance().child('healthCheckService'));
  serviceManager.register(HealthService.getInstance());
  logger.debug('Health Service registered to the service manager');

  logger.info('Starting service manager...');

  await serviceManager.start(ErgoScannerService.getInstance().getName());
  serviceManager.start(HealthService.getInstance().getName());
  serviceManager.start(AssetAggregatorService.getInstance().getName());

  await Promise.resolve(() => {});
};

export default startApp;
