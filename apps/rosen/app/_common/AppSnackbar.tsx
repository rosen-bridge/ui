'use client';

import { Snackbar, Alert } from '@rosen-bridge/ui-kit';

import { useSnackbar } from '@/_contexts/snackbarContext';
const AppSnackbar = () => {
  const { state, closeSnackbar } = useSnackbar();

  return state.isOpen ? (
    <Snackbar
      open={state.isOpen}
      onClose={closeSnackbar}
      autoHideDuration={5000}
    >
      <Alert severity={state.severity!}>{state.message}</Alert>
    </Snackbar>
  ) : null;
};

export default AppSnackbar;
