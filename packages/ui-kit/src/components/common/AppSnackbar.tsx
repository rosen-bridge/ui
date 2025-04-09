'use client';

import { useEffect, useState } from 'react';

import { useSnackbar } from '../../hooks/useSnackbar';
import { isLegacyTheme, useTheme } from '../../hooks/useTheme';
import { Snackbar, Alert, Button } from '../base';

/**
 * global snackbar component that connects to snackbar context and shows and
 * hides the snackbar depending on the context
 */

export const AppSnackbar = () => {
  const { state, closeSnackbar } = useSnackbar();
  const theme = useTheme();
  const [showMore, setShowMore] = useState(false);
  useEffect(() => setShowMore(false), [state.isOpen]);
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
            <Button
              color="inherit"
              size="small"
              style={{ paddingTop: '5px', paddingBottom: '5px' }}
              onClick={() => setShowMore(!showMore)}
            >
              {showMore ? 'LESS' : 'MORE'}
            </Button>
          )
        }
      >
        {state.message}
        {showMore && (
          <div style={{ whiteSpace: 'break-spaces' }}>{state.more!()}</div>
        )}
      </Alert>
    </Snackbar>
  ) : null;
};
