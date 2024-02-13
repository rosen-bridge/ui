import { useContext } from 'react';

import {
  SnackbarStateContext,
  Severity,
  SnackbarPosition,
} from '../contexts/snackbarContext';

/**
 * control opening and closing the snackbar
 */

export const useSnackbar = () => {
  const context = useContext(SnackbarStateContext);
  if (context === undefined) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  const openSnackbar = (
    message: string,
    severity: Severity,
    position?: SnackbarPosition,
  ) => {
    context.dispatch({
      type: 'open',
      message,
      severity,
      position,
    });
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
