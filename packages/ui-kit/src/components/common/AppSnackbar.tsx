'use client';

import { Snackbar, Alert } from '../base';

import { useSnackbar } from '../../hooks/useSnackbar';

/**
 * global snackbar component that connects to snackbar context and shows and
 * hides the snackbar depending on the context
 */

export const AppSnackbar = () => {
  const { state, closeSnackbar } = useSnackbar();

  return state.isOpen ? (
    <Snackbar
      open={state.isOpen}
      onClose={closeSnackbar}
      autoHideDuration={5000}
      sx={(theme) => ({ zIndex: theme.zIndex.modal })}
      anchorOrigin={{
        vertical: state.position.vertical,
        horizontal: state.position.horizontal,
      }}
    >
      <Alert severity={state.severity!}>{state.message}</Alert>
    </Snackbar>
  ) : null;
};
