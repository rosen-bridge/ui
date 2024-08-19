import { useMemo } from 'react';
import { TokenMap } from '@rosen-bridge/tokens';

import { useTokensMap } from './useTokensMap';

/**
 * return TokenMap instance
 */
export const useTokenMap = () => {
  const tokensMapObject = useTokensMap();

  const tokenMap = useMemo(() => {
    return new TokenMap(tokensMapObject);
  }, [tokensMapObject]);

  return tokenMap;
};
