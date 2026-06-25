import { DefaultLogger } from '@rosen-bridge/abstract-logger';
import { ServiceManager } from '@rosen-bridge/service-manager';

import dataSource from './dataSource';
import { AssetAggregatorService } from './services/assetAggregatorService';
import { AssetDataAdapterService } from './services/assetDataAdaptersService';
import { DBService } from './services/dbService';
import { ErgoExtractorService } from './services/ergoExtractorService';
import { ErgoScannerService } from './services/ergoScannerService';
import { EventCountMetricService } from './services/eventCountMetricService';
import { GeneralMetricsService } from './services/generalMetricsService';
import { HealthService } from './services/healthCheckService';
import { LockedAssetsMetricService } from './services/lockedAssetsMetricService';
import { ScannerService } from './services/scannerService';
import { TokenMapService } from './services/tokenMapService';
import { UserEventsMetricService } from './services/userEventsMetricService';

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
  logger.debug('Initializing DBService');
  DBService.init(dataSource, DefaultLogger.getInstance().child('dBService'));
  serviceManager.register(DBService.getInstance());
  logger.debug('DBService registered to the service manager');
  logger.debug('Initializing ErgoScannerService');
  await ErgoScannerService.init(
    DefaultLogger.getInstance().child('ergoScannerService'),
  );
  serviceManager.register(ErgoScannerService.getInstance());
  logger.debug('ErgoScannerService registered to the service manager');
  logger.debug('Initializing TokenMapService');
  await TokenMapService.init(
    DefaultLogger.getInstance().child('tokenMapService'),
  );
  serviceManager.register(TokenMapService.getInstance());
  logger.debug('TokenMapService registered to the service manager');
  logger.debug('Initializing ErgoExtractorService');
  await ErgoExtractorService.init(
    DefaultLogger.getInstance().child('ergoExtractorService'),
  );
  serviceManager.register(ErgoExtractorService.getInstance());
  logger.debug('ErgoExtractorService registered to the service manager');
  logger.debug('Initializing ScannerService');
  ScannerService.init(DefaultLogger.getInstance().child('scannerService'));
  serviceManager.register(ScannerService.getInstance());
  logger.debug('ScannerService registered to the service manager');
  logger.debug('Initializing GeneralMetricsService');
  GeneralMetricsService.init(
    DefaultLogger.getInstance().child('generalMetricsService'),
  );
  serviceManager.register(GeneralMetricsService.getInstance());
  logger.debug('GeneralMetricsService registered to the service manager');

  logger.debug('Initializing AssetDataAdapterService');
  AssetDataAdapterService.init(
    DefaultLogger.getInstance().child('assetDataAdapterService'),
  );
  serviceManager.register(AssetDataAdapterService.getInstance());
  logger.debug('AssetDataAdapterService registered to the service manager');

  logger.debug('Initializing AssetAggregatorService');
  AssetAggregatorService.init(
    DefaultLogger.getInstance().child('assetAggregatorService'),
  );
  serviceManager.register(AssetAggregatorService.getInstance());
  logger.debug('AssetAggregatorService registered to the service manager');

  logger.debug('Initializing LockedAssetsMetricsService');
  LockedAssetsMetricService.init(
    DefaultLogger.getInstance().child('lockedAssetsMetricsService'),
  );
  serviceManager.register(LockedAssetsMetricService.getInstance());
  logger.debug('LockedAssetsMetricsService registered to the service manager');

  logger.debug('Initializing EventCountMetricsService');
  EventCountMetricService.init(
    DefaultLogger.getInstance().child('eventCountMetricsService'),
  );
  serviceManager.register(EventCountMetricService.getInstance());
  logger.debug('EventCountMetricsService registered to the service manager');

  logger.debug('Initializing UserEventsMetricService');
  UserEventsMetricService.init(
    DefaultLogger.getInstance().child('userEventsMetricService'),
  );
  serviceManager.register(UserEventsMetricService.getInstance());
  logger.debug('UserEventsMetricService registered to the service manager');

  logger.debug('Initializing HealthService');
  HealthService.init(DefaultLogger.getInstance().child('healthService'));
  serviceManager.register(HealthService.getInstance());
  logger.debug('HealthService registered to the service manager');

  logger.info('Starting service manager...');

  await serviceManager.start(ErgoScannerService.getInstance().getName());
  await serviceManager.start(ScannerService.getInstance().getName());
  await serviceManager.start(HealthService.getInstance().getName());
  await serviceManager.start(AssetAggregatorService.getInstance().getName());
  await serviceManager.start(GeneralMetricsService.getInstance().getName());
  await serviceManager.start(UserEventsMetricService.getInstance().getName());
  await serviceManager.start(LockedAssetsMetricService.getInstance().getName());
  await serviceManager.start(EventCountMetricService.getInstance().getName());

  await Promise.resolve(() => {});
};

export default startApp;
