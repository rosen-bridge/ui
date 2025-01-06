import WinstonLogger from '@rosen-bridge/winston-logger/dist/WinstonLogger';
import { AssetCalculator } from '@rosen-ui/asset-calculator';

import config from '../configs';
import { ASSET_CALCULATOR_INTERVAL } from '../constants';
import dataSource from '../data-source';
import AppError from '../errors/AppError';
import { getRosenTokens, handleError, runAndSetInterval } from '../utils';

/**
 * run asset calculator update periodically, handling probable errors
 * @param calculator
 * @param updateInterval
 */
const startUpdateJob = (
  calculator: AssetCalculator,
  updateInterval: number,
) => {
  const logger = WinstonLogger.getInstance().getLogger(import.meta.url);

  const tryUpdating = async () => {
    try {
      await calculator.update();
      logger.debug('asset calculator update called successfully');
    } catch (error) {
      const appError = new AppError(
        `asset calculator update failed due to error: ${error}`,
        true,
        'warn',
        error instanceof Error ? error.stack : undefined,
      );
      handleError(appError);
    }
  };

  runAndSetInterval(tryUpdating, updateInterval);

  logger.debug('asset calculator update job was successful', {
    interval: updateInterval,
  });
};

/**
 * start asset calculator service
 */
const start = async () => {
  const logger = WinstonLogger.getInstance().getLogger(import.meta.url);
  const assetCalculator = new AssetCalculator(
    getRosenTokens(),
    {
      addresses: config.calculator.addresses.ergo,
      explorerUrl: config.ergo.explorerUrl,
    },
    {
      addresses: config.calculator.addresses.cardano,
      koiosUrl: config.cardano.koiosUrl,
      authToken: config.cardano.koiosAuthToken,
    },
    {
      addresses: config.calculator.addresses.bitcoin,
      esploraUrl: config.bitcoin.esploraUrl,
    },
    {
      addresses: config.calculator.addresses.ethereum,
      rpcUrl: config.ethereum.rpcUrl,
      authToken: config.ethereum.rpcAuthToken,
    },
    {
      addresses: config.calculator.addresses.binance,
      rpcUrl: config.binance.rpcUrl,
      authToken: config.binance.rpcAuthToken,
    },
    dataSource,
    logger,
  );

  startUpdateJob(assetCalculator, ASSET_CALCULATOR_INTERVAL);
};

const calculatorService = {
  start,
};

export default calculatorService;
