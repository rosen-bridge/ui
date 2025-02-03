import { PropsWithChildren, createContext, useContext, useState } from 'react';

/**
 * access api key to set on the the server request and mutations
 */
export const useApiKey = () => {
  const context = useContext(ApiKeyContext);

  if (!context) {
    throw new Error('useApiKey must be used within ApiKeyProvider');
  }

  return context;
};

export type ApiKeyContextType = {
  apiKey: string | undefined;
  setApiKey: (apiKey: string | undefined) => void;
};

export const ApiKeyContext = createContext<ApiKeyContextType | null>(null);

export const ApiKeyProvider = ({ children }: PropsWithChildren) => {
  const [apiKey, setApiKey] = useState<string>();

  const state = { apiKey, setApiKey };

  return (
    <ApiKeyContext.Provider value={state}>{children}</ApiKeyContext.Provider>
  );
};
