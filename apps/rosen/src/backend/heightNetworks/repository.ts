import { ExtractorStatusEntity } from '@rosen-bridge/abstract-scanner';

import { dataSource } from '../dataSource';
import '../initialize-datasource-if-needed';
import type { NetworkHeight } from './services';

export const getScannersHeights = async (): Promise<NetworkHeight[]> => {
  return await dataSource
    .getRepository(ExtractorStatusEntity)
    .createQueryBuilder('extractor')
    .select('extractor."scannerId"', 'network')
    .addSelect('MAX(extractor."updateHeight")', 'height')
    .groupBy('extractor."scannerId"')
    .orderBy('extractor."scannerId"', 'ASC')
    .getRawMany();
};
