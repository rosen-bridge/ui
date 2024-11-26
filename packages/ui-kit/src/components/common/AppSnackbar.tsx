'use client';

import { useSnackbar } from '../../hooks/useSnackbar';
import { isLegacyTheme, useTheme } from '../../hooks/useTheme';
import { Snackbar, Alert } from '../base';

/**
 * global snackbar component that connects to snackbar context and shows and
 * hides the snackbar depending on the context
 */

export const AppSnackbar = () => {
  const { state, closeSnackbar } = useSnackbar();
  const theme = useTheme();
  return state.isOpen ? (
    <Snackbar
      open={state.isOpen}
      onClose={closeSnackbar}
      autoHideDuration={5000}
      anchorOrigin={{
        vertical: state.position.vertical,
        horizontal: state.position.horizontal,
      }}
    >
      <Alert
        variant={isLegacyTheme(theme) ? 'filled' : 'standard'}
        severity={state.severity!}
      >
        {state.message}
      </Alert>
    </Snackbar>
  ) : null;
};
