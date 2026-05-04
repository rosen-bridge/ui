import { DefaultLogger } from '@rosen-bridge/abstract-logger';
import {
  FailoverStrategy,
  NetworkConnectorManager,
} from '@rosen-bridge/abstract-scanner';
import { BinanceRpcObservationExtractor } from '@rosen-bridge/evm-observation-extractor';
import { EvmRpcNetwork, EvmRpcScanner } from '@rosen-bridge/evm-scanner';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { TransactionResponse } from 'ethers';

import { configs } from '../configs';
import { TokensConfig } from '../tokensConfig';

const logger = DefaultLogger.getInstance().child(import.meta.url);

/**
 * Initializes and configures a Binance Smart Chain scanner instance.
 *
 * @param dataSource - TypeORM DataSource for DB connection
 * @returns Configured and ready-to-use BinanceScanner instance
 * @throws Error if observation extractor creation or registration fails
 */
export const buildBinanceRpcScannerWithExtractors = async (
  dataSource: DataSource,
) => {
  logger.info('Starting Binance scanner initialization...');

  // Create Binance scanner with RPC network settings
  const networkConnectorManager =
    new NetworkConnectorManager<TransactionResponse>(
      new FailoverStrategy(),
      logger.child('binanceScannerLogger'),
    );
  configs.chains.binance.rpc.connections.forEach((rpc) => {
    networkConnectorManager.addConnector(
      new EvmRpcNetwork(rpc.url!, rpc.timeout! * 1000, rpc.authToken),
    );
  });
  const binanceScanner = new EvmRpcScanner('binance', {
    dataSource: dataSource,
    initialHeight: configs.chains.binance.initialHeight,
    network: networkConnectorManager,
    blockRetrieveGap: configs.chains.binance.blockRetrieveGap,
    logger: logger.child('binanceScannerLogger'),
  });

  try {
    const tokenMap = TokensConfig.getInstance().getTokenMap();
    logger.debug('Creating Binance observation extractor...');
    const observationExtractor = new BinanceRpcObservationExtractor(
      configs.contracts.binance.addresses.lock,
      dataSource,
      tokenMap,
      logger.child('binanceObservationExtractor'),
    );

    logger.debug('Registering observation extractor with scanner...');
    await binanceScanner.registerExtractor(observationExtractor);
    logger.info('Binance observation extractor registered successfully');
  } catch (error) {
    logger.error(
      `Failed to create or register Binance observation extractor: ${error instanceof Error ? error.message : error}`,
    );
    if (error instanceof Error && error.stack) {
      logger.debug(error.stack);
    }
  }

  logger.info('Binance scanner initialization completed successfully');
  return binanceScanner;
};
