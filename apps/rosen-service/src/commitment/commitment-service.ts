import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';
import { ErgoScanner } from '@rosen-bridge/scanner';
import { CommitmentExtractor } from '@rosen-bridge/watcher-data-extractor';

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
    const commitmentExtractor = new CommitmentExtractor(
      'ergo-commitment-extractor',
      [configs.ergo.addresses.lock, ...configs.ergo.addresses.commitments],
      configs.ergo.tokens.rwt,
      dataSource,
      await getTokenMap(),
      CallbackLoggerFactory.getInstance().getLogger(
        'ergo-commitment-extractor',
      )
    );
    await scanner.registerExtractor(commitmentExtractor);
    logger.debug(`all commitment-extractors added successfully`);
    // To Do: add more commitment-extractors for other chains
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
