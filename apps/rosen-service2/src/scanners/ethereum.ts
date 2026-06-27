import { DefaultLogger } from '@rosen-bridge/abstract-logger';
import {
  FailoverStrategy,
  NetworkConnectorManager,
} from '@rosen-bridge/abstract-scanner';
import { EthereumRpcObservationExtractor } from '@rosen-bridge/evm-observation-extractor';
import { EvmRpcNetwork, EvmRpcScanner } from '@rosen-bridge/evm-scanner';
import { TokenMap } from '@rosen-bridge/extended-tokens';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { TransactionResponse } from 'ethers';

import { configs } from '../configs';

const logger = DefaultLogger.getInstance().child(import.meta.url);

/**
 * Creates and configures an Ethereum scanner instance.
 *
 * @param dataSource - TypeORM DataSource for DB connection
 * @returns Configured and ready-to-use EthereumScanner instance
 * @throws Error if observation extractor creation or registration fails
 */
export const getEthereumScanner = async (
  dataSource: DataSource,
  tokenMap: TokenMap,
) => {
  logger.info('Starting Ethereum scanner initialization...');

  // Create Ethereum scanner with RPC network settings
  const networkConnectorManager =
    new NetworkConnectorManager<TransactionResponse>(
      new FailoverStrategy(),
      logger.child('ethereumScannerLogger'),
    );
  configs.chains.ethereum.rpc.connections.forEach((rpc) => {
    networkConnectorManager.addConnector(
      new EvmRpcNetwork(rpc.url!, rpc.timeout! * 1000, rpc.authToken),
    );
  });
  const ethereumScanner = new EvmRpcScanner('ethereum', {
    dataSource: dataSource,
    initialHeight: configs.chains.ethereum.initialHeight,
    network: networkConnectorManager,
    blockRetrieveGap: configs.chains.ethereum.blockRetrieveGap,
    logger: logger.child('ethereumScannerLogger'),
  });

  try {
    logger.debug('Creating Ethereum observation extractor...');
    const observationExtractor = new EthereumRpcObservationExtractor(
      configs.contracts.ethereum.addresses.lock,
      dataSource,
      tokenMap,
      logger.child('ethereumObservationExtractor'),
    );

    logger.debug('Registering observation extractor with scanner...');
    await ethereumScanner.registerExtractor(observationExtractor);
    logger.info('Ethereum observation extractor registered successfully');
  } catch (error) {
    logger.error(
      `Failed to create or register Ethereum observation extractor: ${error instanceof Error ? error.message : error}`,
    );
    if (error instanceof Error && error.stack) {
      logger.debug(error.stack);
    }
  }

  logger.info('Ethereum scanner initialization completed successfully');
  return ethereumScanner;
};
