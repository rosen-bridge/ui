import { useEffect, useState, useTransition } from 'react';

import { TokenMap } from '@rosen-bridge/tokens';

import { getTokenMap } from '@/_networks/getTokenMap.client';

/**
 * return TokenMap instance
 */
export const useTokenMap = (): TokenMap => {
  const [tokenMap, setTokenMap] = useState<TokenMap>(
    new TokenMap({ idKeys: {}, tokens: [] }),
  );

  const [, startTransition] = useTransition();
  useEffect(() => {
    startTransition(async () => {
      setTokenMap(await getTokenMap());
    });
  }, []);

  return tokenMap!;
};
