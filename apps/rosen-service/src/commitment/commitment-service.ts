import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';
import { ErgoScanner } from '@rosen-bridge/scanner';
import { CommitmentExtractor } from '@rosen-bridge/watcher-data-extractor';
import { NETWORKS, NETWORKS_KEYS } from '@rosen-ui/constants';

import configs from '../configs';
import dataSource from '../data-source';
import AppError from '../errors/AppError';
import { getTokenMap } from '../utils';

const logger = CallbackLoggerFactory.getInstance().getLogger(import.meta.url);
/**
 * register commitment extractors for all chains
 * @param scanner
 */
export const registerExtractors = async (scanner: ErgoScanner) => {
  try {
    for (let key of NETWORKS_KEYS) {
      const chain = key == NETWORKS['bitcoin-runes'].key ? 'bitcoinRunes' : key;
      const commitmentExtractor = new CommitmentExtractor(
        `${chain}-commitment-extractor`,
        configs[chain].addresses.commitments,
        configs.ergo.tokens.rwt,
        dataSource,
        await getTokenMap(),
        CallbackLoggerFactory.getInstance().getLogger(
          `${chain}-commitment-extractor`,
        ),
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
