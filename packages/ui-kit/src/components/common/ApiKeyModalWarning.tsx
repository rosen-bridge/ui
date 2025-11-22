import { Button } from '@mui/material';
import { ExclamationTriangle } from '@rosen-bridge/icons';

import { useApiKey } from '../../hooks';
import { Typography } from '../base';
import { ApiKeyModal } from './ApiKeyModal';
import { Stack } from './Stack';
import { SvgIcon } from './SvgIcon';

export const ApiKeyModalWarning = () => {
  const { apiKey } = useApiKey();

  if (apiKey) return null;

  return (
    <Stack spacing={1} direction="row" align="center" wrap>
      <SvgIcon color="warning.main">
        <ExclamationTriangle />
      </SvgIcon>

      <Typography color="warning.main">
        You need to set an Api Key before sending
      </Typography>

      <ApiKeyModal>
        {(open) => <Button onClick={open}>Click To Set</Button>}
      </ApiKeyModal>
    </Stack>
  );
};
