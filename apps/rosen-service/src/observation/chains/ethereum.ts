import { EthereumRpcObservationExtractor } from '@rosen-bridge/evm-observation-extractor';
import { EvmRpcScanner } from '@rosen-bridge/evm-rpc-scanner';
import WinstonLogger from '@rosen-bridge/winston-logger';

import config from '../../configs';
import dataSource from '../../data-source';
import AppError from '../../errors/AppError';
import { getRosenTokens } from '../../utils';

const logger = WinstonLogger.getInstance().getLogger(import.meta.url);

/**
 * register an observation extractor for the provided scanner
 * @param scanner
 */
export const registerEthereumExtractor = (scanner: EvmRpcScanner) => {
  try {
    const observationExtractor = new EthereumRpcObservationExtractor(
      config.ethereum.addresses.lock,
      dataSource,
      getRosenTokens(),
      logger,
    );

    scanner.registerExtractor(observationExtractor);

    logger.debug('ethereum observation extractor registered', {
      scannerName: scanner.name(),
    });
  } catch (error) {
    throw new AppError(
      `cannot create or register ethereum observation extractor due to error: ${error}`,
      false,
      'error',
      error instanceof Error ? error.stack : undefined,
      {
        scannerName: scanner.name(),
      },
    );
  }
};
