import type { AbstractLogger } from '@rosen-bridge/abstract-logger';
import type { TokenMap } from '@rosen-bridge/extended-tokens';
import type { DataSource } from '@rosen-bridge/extended-typeorm';
import JsonBigInt from '@rosen-bridge/json-bigint';
import { ErgoNetworkType } from '@rosen-bridge/scanner-interfaces';
import { CommitmentExtractor, EventTriggerExtractor } from '@rosen-bridge/watcher-data-extractor';

import { configs } from './configs';
import type { ChainConfigs } from './types';

/**
 * Maps bigint value in data to string before inserting in redis
 *
 * @returns string
 */
export const stringSerializer = (data: unknown): string =>
  JsonBigInt.stringify(data, (_, value) => (typeof value === 'bigint' ? value.toString() : value));

/**
 * Returns the Ergo node URL used to initialize extractors.
 * Extractors are always initialized using the node; explorer initialization is disabled.
 *
 * @returns {string} Ergo node URL
 */
export const getErgoNodeUrl = (): string => {
  const url = configs.chains.ergo.node.connections[0]?.url;
  if (!url) {
    throw new Error('Ergo node URL is not configured.');
  }
  return url;
};

/**
 * Converts chain key to camelCase or PascalCase.
 */
export const formatChainName = (chain: string, mode: 'camel' | 'pascal' = 'camel'): string => {
  const parts = chain.split('-');

  return parts
    .map((part, index) => {
      if (index === 0 && mode === 'camel') return part;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join('');
};

/**
 * Creates an event trigger extractor
 * @param chain
 * @param dataSource
 * @param chianConfigs
 * @param logger
 * @returns EventTriggerExtractor
 */
export const createEventTrigger = (
  chain: string,
  dataSource: DataSource,
  chianConfigs: ChainConfigs,
  logger: AbstractLogger,
) => {
  return new EventTriggerExtractor(
    `${chain}-trigger-extractor`,
    dataSource,
    ErgoNetworkType.Node,
    getErgoNodeUrl(),
    chianConfigs.addresses.WatcherTriggerEvent,
    chianConfigs.tokens.RWTId,
    chianConfigs.addresses.WatcherPermit,
    chianConfigs.addresses.Fraud,
    logger.child(`${formatChainName(chain, 'camel')}EventTriggerExtractor`),
    configs.eventTriggerExtractor.initialize.active,
  );
};

/**
 * Creates a commitment extractor
 * @param chain
 * @param dataSource
 * @param chianConfigs
 * @param tokenMap
 * @param logger
 * @returns CommitmentExtractor
 */
export const createCommitmentExtractor = (
  chain: string,
  dataSource: DataSource,
  chianConfigs: ChainConfigs,
  tokenMap: TokenMap,
  logger: AbstractLogger,
) => {
  logger.debug(`starting commitment extractor for ${chain}`);
  return new CommitmentExtractor(
    `${chain}-commitment-extractor`,
    [chianConfigs.addresses.Commitment],
    chianConfigs.tokens.RWTId,
    dataSource,
    tokenMap,
    {
      active: configs.commitmentExtractor.initialize.active,
      type: ErgoNetworkType.Node,
      url: getErgoNodeUrl(),
      maxParallelRequests: configs.commitmentExtractor.initialize.maxParallelRequests,
    },
    logger.child(`${chain}CommitmentExtractor`),
  );
};
