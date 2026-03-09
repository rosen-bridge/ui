import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { WatcherCountType } from '@rosen-ui/rosen-statistics-entity';

import { WATCHER_COUNT_REGISTER } from '../constants';
import { WatcherBox, WatcherCountConfig } from '../types';

/**
 * Calculate watcher counts for a list of boxes grouped by network.
 *
 * @param boxes - Array of watcher boxes (Explorer or Node boxes)
 * @param getRegisterValue - Function to get the watcher count from a box by register
 * @param config - Watcher count configuration
 * @param logger - Logger instance
 *
 * @returns Object containing networkWatcherCounts array and totalWatchers number
 */
export const calculateWatcherCounts = (
  boxes: WatcherBox[],
  getRegisterValue: (box: WatcherBox, register: string) => number,
  config: WatcherCountConfig,
  logger: AbstractLogger,
): { networkWatcherCounts: WatcherCountType[]; totalWatchers: number } => {
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

    const count = getRegisterValue(box, WATCHER_COUNT_REGISTER);

    networkWatcherCounts.push({ network, count });
    totalWatchers += count;

    logger.debug(`Network: ${network}, Watchers: ${count}`);
  }

  return { networkWatcherCounts, totalWatchers };
};
