import { In } from '@rosen-bridge/extended-typeorm';
import { TokenEntity } from '@rosen-ui/asset-calculator';

import { dataSource } from '../dataSource';
import '../initialize-datasource-if-needed';

const tokenRepository = dataSource.getRepository(TokenEntity);

/**
 * get token rows for a batch of token ids
 * @param ids
 */
export const getTokensByIds = (ids: string[]): Promise<TokenEntity[]> => {
  if (!ids.length) return Promise.resolve([]);

  return tokenRepository.find({
    where: { id: In(ids) },
  });
};
