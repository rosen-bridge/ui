import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';
import { EthereumRpcObservationExtractor } from '@rosen-bridge/evm-observation-extractor';
import { EvmRpcNetwork, EvmRpcScanner } from '@rosen-bridge/evm-rpc-scanner';
import { DataSource } from '@rosen-bridge/extended-typeorm';

import { configs } from '../configs';
import { TokensConfig } from '../tokensConfig';

const logger = CallbackLoggerFactory.getInstance().getLogger(import.meta.url);

/**
 * Initializes and configures an Ethereum scanner instance.
 *
 * @param dataSource - TypeORM DataSource for DB connection
 * @returns Configured and ready-to-use EthereumScanner instance
 * @throws Error if observation extractor creation or registration fails
 */
export const buildEthereumEvmScannerWithExtractors = async (
  dataSource: DataSource,
) => {
  logger.info('Starting Ethereum scanner initialization...');

  // Create Ethereum scanner with RPC network settings
  const ethereumScanner = new EvmRpcScanner('ethereum', {
    dataSource: dataSource,
    initialHeight: configs.chains.ethereum.initialHeight,
    network: new EvmRpcNetwork(
      configs.chains.ethereum.rpc.url,
      configs.chains.ethereum.rpc.timeout * 1000,
      configs.chains.ethereum.rpc.authToken,
    ),
    blockRetrieveGap: configs.chains.ethereum.blockRetrieveGap,
    suffix: configs.chains.ethereum.rpc.suffix,
    logger: CallbackLoggerFactory.getInstance().getLogger(
      'ethereum-scanner-logger',
    ),
  });

  try {
    const tokenMap = TokensConfig.getInstance().getTokenMap();
    logger.debug('Creating Ethereum observation extractor...');
    const observationExtractor = new EthereumRpcObservationExtractor(
      configs.contracts.ethereum.addresses.lock,
      dataSource,
      tokenMap,
      CallbackLoggerFactory.getInstance().getLogger(
        'ethereum-observation-extractor',
      ),
    );

    logger.debug('Registering observation extractor with scanner...');
    await ethereumScanner.registerExtractor(observationExtractor);
    logger.info('Ethereum observation extractor registered successfully');
  } catch (error) {
    logger.error(
      `Failed to create or register Ethereum observation extractor: ${error instanceof Error ? error.message : error}`,
    );
  }

  logger.info('Ethereum scanner initialization completed successfully');
  return ethereumScanner;
};
