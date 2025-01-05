import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
  useTransition,
} from 'react';

import { TokenMap } from '@rosen-bridge/tokens';

import { getTokenMap } from '@/_tokenMap/getClientTokenMap';

/**
 * return TokenMap instance
 */
export const useTokenMap = () => {
  const context = useContext(TokenMapContext);

  if (!context) {
    throw new Error('useTokenMap must be used within TokenMapProvider');
  }

  return context;
};

export type TokenMapContextType = TokenMap;

export const TokenMapContext = createContext<TokenMap | null>(null);

export const TokenMapProvider = ({ children }: PropsWithChildren) => {
  const [tokenMap, setTokenMap] = useState(
    new TokenMap({ idKeys: {}, tokens: [] }),
  );

  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      try {
        setTokenMap(await getTokenMap());
      } catch (error) {
        throw new Error('Failed to fetch TokenMap, reload the page.', {
          cause: error,
        });
      }
    });
  }, []);

  return (
    <TokenMapContext.Provider value={tokenMap}>
      {children}
    </TokenMapContext.Provider>
  );
};
