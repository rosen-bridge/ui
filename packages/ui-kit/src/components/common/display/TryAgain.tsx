import { ButtonProps } from '@mui/material';
import { SyncExclamation } from '@rosen-bridge/icons';

import { Button, Stack, SvgIcon, Typography } from '../../base';
import { InjectOverrides } from '../InjectOverrides';

export type TryAgainProps = {} & ButtonProps;

/**
 * A simple UI component for retrying failed actions (e.g., when an API call fails).
 *
 * Renders a button with an error icon and "TRY AGAIN!" text.
 * Inherits all props from MUI's `Button`.
 *
 * @example
 * <TryAgain onClick={handleRetry} />
 */
const TryAgainBase = ({ ...props }: TryAgainProps) => {
  return (
    <Button variant="text" {...props}>
      <Stack direction="column" alignItems="center">
        <SvgIcon sx={{ color: 'error.main' }}>
          <SyncExclamation />
        </SvgIcon>
        <Typography color="error.main">TRY AGAIN!</Typography>
      </Stack>
    </Button>
  );
};

export const TryAgain = InjectOverrides(TryAgainBase);
