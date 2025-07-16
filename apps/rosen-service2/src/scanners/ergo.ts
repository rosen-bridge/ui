import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { ErgoObservationExtractor } from '@rosen-bridge/observation-extractor';
import {
  ErgoExplorerNetwork,
  ErgoNodeNetwork,
  ErgoScanner,
  FailoverStrategy,
  NetworkConnectorManager,
} from '@rosen-bridge/scanner';
import { ErgoNetworkType, Transaction } from '@rosen-bridge/scanner-interfaces';
import { EventTriggerExtractor } from '@rosen-bridge/watcher-data-extractor';
import { NETWORKS } from '@rosen-ui/constants';

import { configs } from '../configs';
import { ERGO_METHOD_EXPLORER } from '../constants';
import { TokensConfig } from '../tokensConfig';
import { ChainConfigs } from '../types';

const logger = CallbackLoggerFactory.getInstance().getLogger(import.meta.url);

/**
 * create an event trigger extractor
 * @param chain
 * @param networkType
 * @param url
 * @param dataSource
 * @param chianConfigs
 * @returns EventTriggerExtractor
 */
const createEventTrigger = (
  chain: string,
  networkType: ErgoNetworkType,
  url: string,
  dataSource: DataSource,
  chianConfigs: ChainConfigs,
) => {
  return new EventTriggerExtractor(
    `${chain}-extractor`,
    dataSource,
    networkType,
    url,
    chianConfigs.addresses.WatcherTriggerEvent,
    chianConfigs.tokens.RWTId,
    chianConfigs.addresses.WatcherPermit,
    chianConfigs.addresses.Fraud,
    CallbackLoggerFactory.getInstance().getLogger(
      `${chain}-event-trigger-extractor`,
    ),
  );
};

/**
 * Initializes and configures an Ergo scanner instance.
 *
 * @param dataSource - TypeORM DataSource for DB connection
 * @returns Configured and ready-to-use ErgoScanner instance
 * @throws Error if observation extractor creation or registration fails
 */
export const initializeErgoScanner = async (dataSource: DataSource) => {
  logger.info('Starting Ergo scanner initialization...');

  // Create Ergo scanner with Explorer network settings
  const networkConnectorManager = new NetworkConnectorManager<Transaction>(
    new FailoverStrategy(),
    logger,
  );
  if (configs.chains.ergo.method == ERGO_METHOD_EXPLORER) {
    networkConnectorManager.addConnector(
      new ErgoExplorerNetwork(configs.chains.ergo.explorer.url!),
    );
  } else {
    networkConnectorManager.addConnector(
      new ErgoNodeNetwork(configs.chains.ergo.node.url!),
    );
  }
  const ergoScanner = new ErgoScanner({
    dataSource: dataSource,
    initialHeight: configs.chains.ergo.initialHeight,
    network: networkConnectorManager,
    blockRetrieveGap: configs.chains.ergo.blockRetrieveGap,
    logger: logger,
  });

  const ergoObservationExtractor = new ErgoObservationExtractor(
    dataSource,
    TokensConfig.getInstance().getTokenMap(),
    configs.contracts.ergo.addresses.lock,
    logger,
  );
  await ergoScanner.registerExtractor(ergoObservationExtractor);

  let networkType: ErgoNetworkType;
  let url: string;
  if (configs.chains.ergo.method == ERGO_METHOD_EXPLORER) {
    networkType = ErgoNetworkType.Explorer;
    url = configs.chains.ergo.explorer.url!;
  } else {
    networkType = ErgoNetworkType.Node;
    url = configs.chains.ergo.node.url!;
  }

  try {
    const ergoEventTriggerExtractor = createEventTrigger(
      NETWORKS.ergo.key,
      networkType,
      url,
      dataSource,
      configs.contracts.ergo,
    );
    await ergoScanner.registerExtractor(ergoEventTriggerExtractor);
    if (configs.chains.cardano.active)
      await ergoScanner.registerExtractor(
        createEventTrigger(
          NETWORKS.cardano.key,
          networkType,
          url,
          dataSource,
          configs.contracts.cardano,
        ),
      );
    if (configs.chains.bitcoin.active)
      await ergoScanner.registerExtractor(
        createEventTrigger(
          NETWORKS.binance.key,
          networkType,
          url,
          dataSource,
          configs.contracts.bitcoin,
        ),
      );
    if (configs.chains.doge.active)
      await ergoScanner.registerExtractor(
        createEventTrigger(
          NETWORKS.doge.key,
          networkType,
          url,
          dataSource,
          configs.contracts.doge,
        ),
      );
    if (configs.chains.ethereum.active)
      await ergoScanner.registerExtractor(
        createEventTrigger(
          NETWORKS.ethereum.key,
          networkType,
          url,
          dataSource,
          configs.contracts.ethereum,
        ),
      );
    if (configs.chains.binance.active)
      await ergoScanner.registerExtractor(
        createEventTrigger(
          NETWORKS.binance.key,
          networkType,
          url,
          dataSource,
          configs.contracts.binance,
        ),
      );
  } catch (error) {
    throw new Error(
      `cannot create or register event trigger extractors due to error: ${error}`,
    );
  }

  logger.info('Ergo scanner initialization completed successfully');
  return ergoScanner;
};
