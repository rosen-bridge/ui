import { DefaultLogger } from '@rosen-bridge/abstract-logger';
import { ServiceManager } from '@rosen-bridge/service-manager';
import { AbstractErgoExtractorsService } from 'services/abstracts/abstractErgoExtractor';

import dataSource from './dataSource';
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
    DefaultLogger.getInstance().child('ServiceManager'),
  );
  logger.debug('Initializing DBService');
  DBService.init(dataSource, DefaultLogger.getInstance().child('DBService'));
  serviceManager.register(DBService.getInstance());
  logger.debug('DBService registered to the service manager');
  logger.debug('Initializing ErgoScannerService');
  await ErgoScannerService.init(
    DefaultLogger.getInstance().child('ErgoScannerService'),
  );
  serviceManager.register(ErgoScannerService.getInstance());
  logger.debug('ErgoScannerService registered to the service manager');
  logger.debug('Initializing TokenMapService');
  await TokenMapService.init(
    DefaultLogger.getInstance().child('TokenMapService'),
  );
  serviceManager.register(TokenMapService.getInstance());
  logger.debug('TokenMapService registered to the service manager');
  logger.debug('Initializing ErgoExtractorService');
  await ErgoExtractorService.init(
    DefaultLogger.getInstance().child('ErgoExtractorService'),
  );
  serviceManager.register(AbstractErgoExtractorsService.getInstance());
  logger.debug('ErgoExtractorService registered to the service manager');
  logger.debug('Initializing ScannerService');
  ScannerService.init(DefaultLogger.getInstance().child('ScannerService'));
  serviceManager.register(ScannerService.getInstance());
  logger.debug('ScannerService registered to the service manager');
  logger.debug('Initializing GeneralMetricsService');
  GeneralMetricsService.init(
    DefaultLogger.getInstance().child('GeneralMetricsService'),
  );
  serviceManager.register(GeneralMetricsService.getInstance());
  logger.debug('GeneralMetricsService registered to the service manager');

  logger.debug('Initializing AssetDataAdapterService');
  AssetDataAdapterService.init(
    DefaultLogger.getInstance().child('AssetDataAdapterService'),
  );
  serviceManager.register(AssetDataAdapterService.getInstance());
  logger.debug('AssetDataAdapterService registered to the service manager');

  logger.debug('Initializing AssetAggregatorService');
  AssetAggregatorService.init(
    DefaultLogger.getInstance().child('AssetAggregatorService'),
  );
  serviceManager.register(AssetAggregatorService.getInstance());
  logger.debug('AssetAggregatorService registered to the service manager');

  logger.debug('Initializing LockedAssetsMetricsService');
  LockedAssetsMetricService.init(
    DefaultLogger.getInstance().child('LockedAssetsMetricsService'),
  );
  serviceManager.register(LockedAssetsMetricService.getInstance());
  logger.debug('LockedAssetsMetricsService registered to the service manager');

  logger.debug('Initializing EventCountMetricsService');
  EventCountMetricService.init(
    DefaultLogger.getInstance().child('EventCountMetricsService'),
  );
  serviceManager.register(EventCountMetricService.getInstance());
  logger.debug('EventCountMetricsService registered to the service manager');

  logger.debug('Initializing UserEventsMetricService');
  UserEventsMetricService.init(
    DefaultLogger.getInstance().child('UserEventsMetricService'),
  );
  serviceManager.register(UserEventsMetricService.getInstance());
  logger.debug('UserEventsMetricService registered to the service manager');

  logger.debug('Initializing HealthCheckService');
  HealthService.init(DefaultLogger.getInstance().child('HealthCheckService'));
  serviceManager.register(HealthService.getInstance());
  logger.debug('HealthCheckService to the service manager');

  logger.info('Starting service manager...');

  await serviceManager.start(ErgoScannerService.getInstance().getName());
  await serviceManager.start(HealthService.getInstance().getName());
  await serviceManager.start(AssetAggregatorService.getInstance().getName());

  await Promise.resolve(() => {});
};

export default startApp;
