import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { WatcherCountType } from '@rosen-ui/rosen-statistics-entity';

import { WATCHER_COUNT_REGISTER } from '../constants';
import {
  WatcherBoxType,
  WatcherCountConfig,
  WatcherCountResult,
} from '../types';

/**
 * Calculate watcher counts for a list of boxes grouped by network.
 *
 * @param boxes - Array of watcher boxes (Explorer or Node boxes)
 * @param getWatcherCount - Function to get the watcher count from a box by register
 * @param config - Watcher count configuration
 * @param logger - Logger instance
 *
 * @returns Object containing networkWatcherCounts array and totalWatchers number
 */
export const calculateWatcherCounts = (
  boxes: WatcherBoxType[],
  getWatcherCount: (
    box: WatcherBoxType,
    register: string,
  ) => number | undefined,
  config: WatcherCountConfig,
  logger: AbstractLogger,
): WatcherCountResult => {
  const networkWatcherCounts: WatcherCountType[] = [];
  let totalWatchers = 0;

  for (const box of boxes) {
    const networkToken = box.assets?.find((asset) =>
      config.rwtTokenMap.has(asset.tokenId),
    );

    if (!networkToken) {
      logger.debug(
        `Skipping box ${box.boxId}: rwtTokenId not found in box assets`,
      );
      continue;
    }

    const network = config.rwtTokenMap.get(networkToken.tokenId);
    if (!network) continue;

    logger.debug(
      `Resolved network ${network} from rwt token ${networkToken.tokenId} in box ${box.boxId}`,
    );

    const count = getWatcherCount(box, WATCHER_COUNT_REGISTER);

    if (!count) {
      logger.debug(
        `Skipping box ${box.boxId}: watcher count register not found`,
      );
      continue;
    }

    networkWatcherCounts.push({ network, count });
    totalWatchers += count;

    logger.debug(
      `Watcher count extracted ->  network: ${network}, watchers: ${count}`,
    );
  }

  return { networkWatcherCounts, totalWatchers };
};
