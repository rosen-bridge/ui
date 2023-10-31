import { createContext } from 'react';

import { RosenTokens } from '@rosen-bridge/tokens';

/**
 * a context to share current tokens map in all server components
 */
export const TokensMapContext = createContext<RosenTokens | undefined>(
  undefined,
);

type TokensMapProviderProps = {
  children: React.ReactNode;
  tokensMap: RosenTokens;
};

/**
 * the context provider for the tokens map config
 */

export function TokensMapProvider({
  children,
  tokensMap,
}: TokensMapProviderProps) {
  return (
    <TokensMapContext.Provider value={tokensMap}>
      {children}
    </TokensMapContext.Provider>
  );
}
