import { BlockEntity, PROCEED } from '@rosen-bridge/scanner';
import dataSource from '../data-source';

/**
 * returns the last saved block height based on the scanner name
 * @param scanner considering scanned blocks by this scanner
 */
export const getLastSavedBlock = async (scanner: string) => {
  const lastBlock = await dataSource.getRepository(BlockEntity).find({
    where: { status: PROCEED, scanner: scanner },
    order: { height: 'DESC' },
    take: 1,
  });
  if (lastBlock.length !== 0) {
    return lastBlock[0].height;
  }
  throw new Error('No block found or error in database connection');
};
