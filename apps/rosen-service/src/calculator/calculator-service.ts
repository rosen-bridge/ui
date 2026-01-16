import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';
import { AssetCalculator } from '@rosen-ui/asset-calculator';

import config from '../configs';
import { ASSET_CALCULATOR_INTERVAL } from '../constants';
import dataSource from '../data-source';
import AppError from '../errors/AppError';
import { getTokenMap, handleError, runAndSetInterval } from '../utils';

/**
 * run asset calculator update periodically, handling probable errors
 * @param calculator
 * @param updateInterval
 */
const startUpdateJob = async (
  calculator: AssetCalculator,
  updateInterval: number,
) => {
  const logger = CallbackLoggerFactory.getInstance().getLogger(import.meta.url);

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
      handleError(appError, logger);
    }
  };

  await runAndSetInterval(tryUpdating, updateInterval);

  logger.debug('asset calculator update job was successful', {
    interval: updateInterval,
  });
};

/**
 * start asset calculator service
 */
const start = async () => {
  const logger = CallbackLoggerFactory.getInstance().getLogger(import.meta.url);
  const assetCalculator = new AssetCalculator(
    await getTokenMap(),
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
      addresses: config.calculator.addresses.bitcoinRunes,
      unisatUrl: config.bitcoinRunes.unisatUrl,
      unisatApiKey: config.bitcoinRunes.unisatApiKey,
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
    {
      addresses: config.calculator.addresses.doge,
      blockcypherUrl: config.doge.blockcypherUrl,
    },
    dataSource,
    logger,
  );

  await startUpdateJob(assetCalculator, ASSET_CALCULATOR_INTERVAL);
};

const calculatorService = {
  start,
};

export default calculatorService;
