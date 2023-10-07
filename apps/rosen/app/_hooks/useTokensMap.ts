import { useContext } from 'react';

import { TokensMapContext } from '../_contexts/tokenMapProvider';

/**
 * access tokens map context to get bridge token map configs
 */

export const useTokensMap = () => {
  const tokensMap = useContext(TokensMapContext);
  if (tokensMap === undefined) {
    throw new Error(
      'useSnackbar must be used within a TokensMap Context Provider',
    );
  }

  return tokensMap;
};
