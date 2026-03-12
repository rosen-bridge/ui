import { useSnackbar } from '../../hooks';
import { Snackbar, Alert } from '../base';
import { CopyButton } from '../copyButton';

/**
 * global snackbar component that connects to snackbar context and shows and
 * hides the snackbar depending on the context
 */
export const AppSnackbar = () => {
  const { state, closeSnackbar } = useSnackbar();

  if (!state.isOpen) return null;

  return (
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
        variant="standard"
        severity={state.severity!}
        action={
          state.more && (
            <CopyButton
              value={() => state.more?.()}
              color="inherit"
              size="small"
              style={{ paddingTop: '5px', paddingBottom: '5px' }}
            />
          )
        }
      >
        {state.message}
      </Alert>
    </Snackbar>
  );
};
