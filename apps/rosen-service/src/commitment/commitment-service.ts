import { DefaultLogger } from '@rosen-bridge/abstract-logger';
import type { ErgoScanner } from '@rosen-bridge/ergo-scanner';
import { CommitmentExtractor } from '@rosen-bridge/watcher-data-extractor';
import { NETWORKS, NETWORKS_KEYS } from '@rosen-ui/constants';

import configs from '../configs';
import { BITCOIN_RUNES_CONFIG_KEY } from '../constants';
import dataSource from '../data-source';
import AppError from '../errors/AppError';
import { getTokenMap } from '../utils';

const logger = DefaultLogger.getInstance().child(import.meta.url);
/**
 * register commitment extractors for all chains
 * @param scanner
 */
export const registerExtractors = async (scanner: ErgoScanner) => {
  try {
    for (const key of NETWORKS_KEYS) {
      const chain =
        key === NETWORKS['bitcoin-runes'].key ? BITCOIN_RUNES_CONFIG_KEY : key;
      const chainConfig = configs[chain];

      const commitmentExtractor = new CommitmentExtractor(
        `${chain}-commitment-extractor`,
        [chainConfig.addresses.commitment],
        chainConfig.tokens.rwt,
        dataSource,
        await getTokenMap(),
        logger.child(`${chain}CommitmentExtractor`),
      );
      await scanner.registerExtractor(commitmentExtractor);
    }
    logger.debug(`All chains commitment-extractors added successfully`);
  } catch (error) {
    throw new AppError(
      `cannot create or register commitment extractors due to error: ${error}`,
      false,
      'error',
      error instanceof Error ? error.stack : undefined,
      {
        scannerName: scanner.name(),
      },
    );
  }
};

const commitmentService = {
  registerExtractors,
};

export default commitmentService;
