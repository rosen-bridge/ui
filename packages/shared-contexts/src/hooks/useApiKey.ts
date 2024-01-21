import { useCallback, useContext } from 'react';

import { ApiKeyContext } from '../contexts/apiKeyContext';

/**
 * access api key to set on the the server request and mutations
 */

export const useApiKey = () => {
  const apiKeyContext = useContext(ApiKeyContext);

  if (apiKeyContext === undefined) {
    throw new Error('useApiKey must be used within a ApiKey Context Provider');
  }
  const { state, dispatch } = apiKeyContext;

  const setApiKey = useCallback(
    (apiKey: string) => {
      dispatch({ type: 'set', apiKey });
    },
    [dispatch],
  );

  const removeApiKey = useCallback(
    (apiKey: string) => {
      dispatch({ type: 'remove' });
    },
    [dispatch],
  );

  return {
    apiKey: state.selectedApiKey,
    setApiKey,
    removeApiKey,
  };
};
