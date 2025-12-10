import { BlockEntity } from '@rosen-bridge/abstract-scanner';

import { dataSource } from '../dataSource';
import '../initialize-datasource-if-needed';
import { NetworkHeight } from './services';

export const getScannersHeights = async (): Promise<NetworkHeight[]> => {
  const rawData = await dataSource
    .getRepository(BlockEntity)
    .createQueryBuilder('block')
    .select('block.scanner', 'scanner')
    .addSelect('MAX(block.height)', 'height')
    .groupBy('block.scanner')
    .getRawMany();

  const result: NetworkHeight[] = rawData.map((item) => ({
    network: item.scanner,
    height: item.height,
  }));
  return result;
};
