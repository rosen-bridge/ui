import { useContext } from 'react';

import { SnackbarStateContext, Severity } from '../contexts/snackbarContext';

/**
 * control opening and closing the snackbar
 */

export const useSnackbar = () => {
  const context = useContext(SnackbarStateContext);
  if (context === undefined) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  const openSnackbar = (message: string, severity: Severity) => {
    context.dispatch({ type: 'open', message, severity });
  };

  const closeSnackbar = () => {
    context.dispatch({ type: 'close' });
  };

  return {
    state: context.state,
    openSnackbar,
    closeSnackbar,
  };
};
