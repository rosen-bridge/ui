import { Alert, Button } from '@mui/material';

import { useApiKey } from '../../hooks';
import { ApiKeyModal } from './ApiKeyModal';

export const ApiKeyModalWarning = () => {
  const { apiKey } = useApiKey();

  if (apiKey) return null;

  return (
    <div style={{ containerType: 'inline-size' }}>
      <Alert
        severity="warning"
        sx={{
          '@container (max-width: 480px)': {
            'display': 'grid',
            'grid-template-columns': 'auto 1fr',
            '.MuiAlert-action': {
              'grid-column': '2',
              'grid-row': '2',
            },
          },
        }}
        action={
          <ApiKeyModal>
            {(open) => (
              <Button size="small" sx={{ py: '5px' }} onClick={open}>
                SET API KEY
              </Button>
            )}
          </ApiKeyModal>
        }
      >
        You need to set an Api Key before sending.
      </Alert>
    </div>
  );
};
