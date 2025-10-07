'use client';

import { SvgIcon } from '@mui/material';
import { FileCopyAlt } from '@rosen-bridge/icons';

import { useSnackbar } from '../../hooks';
import { isLegacyTheme, useTheme } from '../../hooks/useTheme';
import { Snackbar, Alert, IconButton } from '../base';

/**
 * global snackbar component that connects to snackbar context and shows and
 * hides the snackbar depending on the context
 */
export const AppSnackbar = () => {
  const { state, closeSnackbar } = useSnackbar();
  const theme = useTheme();

  const handleCopyMore = async () => {
    if (state.more) {
      try {
        await navigator.clipboard.writeText(state.more());
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

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
        action={
          state.more && (
            <IconButton
              color="inherit"
              size="small"
              style={{ paddingTop: '5px', paddingBottom: '5px' }}
              onClick={handleCopyMore}
            >
              <SvgIcon>
                <FileCopyAlt />
              </SvgIcon>
            </IconButton>
          )
        }
      >
        {state.message}
      </Alert>
    </Snackbar>
  ) : null;
};
