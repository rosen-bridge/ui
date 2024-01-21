import { createContext, useReducer, useMemo } from 'react';

type Action =
  | {
      type: 'set';
      apiKey: string;
    }
  | { type: 'remove' };
type Dispatch = (action: Action) => void;

type State = { selectedApiKey: string | null };

/**
 * a context to make api key available to all the
 * program
 */
export const ApiKeyContext = createContext<
  { state: State; dispatch: Dispatch } | undefined
>(undefined);

function walletReducer(state: State, action: Action) {
  switch (action.type) {
    case 'set': {
      return {
        selectedApiKey: action.apiKey,
      };
    }
    case 'remove': {
      return {
        selectedApiKey: null,
      };
    }
    default: {
      throw new Error(`Unhandled action type`);
    }
  }
}

type ApiKeyContextProviderProps = { children: React.ReactNode };

/**
 * the context provider for the api key
 */

function ApiKeyContextProvider({ children }: ApiKeyContextProviderProps) {
  const [state, dispatch] = useReducer(walletReducer, {
    selectedApiKey: null,
  });

  const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return (
    <ApiKeyContext.Provider value={value}>{children}</ApiKeyContext.Provider>
  );
}

export { ApiKeyContextProvider };
