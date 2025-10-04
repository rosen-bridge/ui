import { ExclamationTriangle } from '@rosen-bridge/icons';

import { useApiKey } from '../../hooks';
import { Button, Grid, SvgIconMui, Typography } from '../base';
import { ApiKeyModal } from './ApiKeyModal';

export const ApiKeyModalWarning = () => {
  const { apiKey } = useApiKey();

  if (apiKey) return null;

  return (
    <Grid
      container
      alignItems="center"
      gap={1}
      sx={(theme) => ({ color: theme.palette.warning.main })}
    >
      <Grid item>
        <SvgIconMui>
          <ExclamationTriangle />
        </SvgIconMui>
      </Grid>
      <Grid item>
        <Typography>You need to set an Api Key before sending</Typography>
      </Grid>
      <Grid item>
        <ApiKeyModal>
          {(open) => <Button onClick={open}>Click To Set</Button>}
        </ApiKeyModal>
      </Grid>
    </Grid>
  );
};
