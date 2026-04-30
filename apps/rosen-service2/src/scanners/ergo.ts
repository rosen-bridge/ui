import { DefaultLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { ErgoNetworkType } from '@rosen-bridge/scanner-interfaces';
import { EventTriggerExtractor } from '@rosen-bridge/watcher-data-extractor';

import { ChainConfigs } from '../types';
import { formatChainName } from '../utils';

const logger = DefaultLogger.getInstance().child(import.meta.url);

/**
 * create an event trigger extractor
 * @param chain
 * @param networkType
 * @param url
 * @param dataSource
 * @param chianConfigs
 * @returns EventTriggerExtractor
 */
export const createEventTrigger = (
  chain: string,
  networkType: ErgoNetworkType,
  url: string,
  dataSource: DataSource,
  chianConfigs: ChainConfigs,
) => {
  return new EventTriggerExtractor(
    `${chain}-extractor`,
    dataSource,
    networkType,
    url,
    chianConfigs.addresses.WatcherTriggerEvent,
    chianConfigs.tokens.RWTId,
    chianConfigs.addresses.WatcherPermit,
    chianConfigs.addresses.Fraud,
    logger.child(`${formatChainName(chain, 'pascal')}EventTriggerExtractor`),
  );
};
