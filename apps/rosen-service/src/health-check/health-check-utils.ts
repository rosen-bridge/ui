import { BlockEntity, PROCEED } from '@rosen-bridge/abstract-scanner';
import { LastSavedBlock } from '@rosen-bridge/scanner-sync-check';

import dataSource from '../data-source';

/**
 * returns the last saved block height based on the scanner name
 * @param scanner considering scanned blocks by this scanner
 */
export const getLastSavedBlock = async (
  scanner: string,
): Promise<LastSavedBlock> => {
  const lastBlock = await dataSource.getRepository(BlockEntity).find({
    where: { status: PROCEED, scanner: scanner },
    order: { height: 'DESC' },
    take: 1,
  });
  if (lastBlock.length !== 0) {
    return { height: lastBlock[0].height, timestamp: lastBlock[0].timestamp };
  }
  throw new Error('No block found or error in database connection');
};
