import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import {
  ErgoExplorerNetwork,
  ErgoNodeNetwork,
  ErgoScanner,
  FailoverStrategy,
  NetworkConnectorManager,
} from '@rosen-bridge/scanner';
import { Transaction } from '@rosen-bridge/scanner-interfaces';

import { configs } from '../configs';
import { ERGO_METHOD_EXPLORER } from '../constants';

const logger = CallbackLoggerFactory.getInstance().getLogger(import.meta.url);

/**
 * Initializes and configures an Ergo scanner instance.
 *
 * @param dataSource - TypeORM DataSource for DB connection
 * @returns Configured and ready-to-use ErgoScanner instance
 * @throws Error if observation extractor creation or registration fails
 */
export const initializeErgoScanner = (dataSource: DataSource) => {
  logger.info('Starting Ergo scanner initialization...');

  // Create Ergo scanner with Explorer network settings
  const networkConnectorManager = new NetworkConnectorManager<Transaction>(
    new FailoverStrategy(),
    logger,
  );
  if (configs.chains.ergo.method == ERGO_METHOD_EXPLORER) {
    configs.chains.ergo.explorer.connections.forEach((explorer) => {
      networkConnectorManager.addConnector(
        new ErgoExplorerNetwork(explorer.url!),
      );
    });
  } else {
    configs.chains.ergo.node.connections.forEach((node) => {
      networkConnectorManager.addConnector(new ErgoNodeNetwork(node.url!));
    });
  }
  const ergoScanner = new ErgoScanner({
    dataSource: dataSource,
    initialHeight: configs.chains.ergo.initialHeight,
    network: networkConnectorManager,
    blockRetrieveGap: configs.chains.ergo.blockRetrieveGap,
    logger: logger,
  });

  logger.info('Ergo scanner initialization completed successfully');
  return ergoScanner;
};
