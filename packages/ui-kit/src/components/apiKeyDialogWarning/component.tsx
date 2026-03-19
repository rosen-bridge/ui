import { ComponentProps, useState } from 'react';

import { OverridableType } from '@/types';
import { Alert, ApiKeyDialog, Button } from '@/components';
import { ElementBaseProps, Root, Wrap } from '@/core';
import { useApiKey } from '@/hooks';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ApiKeyDialogWarningOverrides {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type ApiKeyDialogWarningOwnProps = {};

export type ApiKeyDialogWarningBaseProps = ElementBaseProps<
  'div',
  ApiKeyDialogWarningOwnProps
>;

export type ApiKeyDialogWarningOverriddenProps = OverridableType<
  ApiKeyDialogWarningBaseProps,
  ApiKeyDialogWarningOverrides,
  never
>;

export const ApiKeyDialogWarningBase = ({
  ...rest
}: ApiKeyDialogWarningOverriddenProps) => {
  const { apiKey } = useApiKey();

  const [isOpen, setIsOpen] = useState(false);

  if (apiKey) return null;

  return (
    <Root styles={{ containerType: 'inline-size' }} {...rest}>
      <Alert
        severity="warning"
        sx={{
          '@container (max-width: 480px)': {
            'display': 'grid',
            'gridTemplateColumns': 'auto 1fr',
            '.MuiAlert-action': {
              gridColumn: '2',
              gridRow: '2',
            },
          },
        }}
        action={
          <Button size="small" onClick={() => setIsOpen(true)}>
            SET API KEY
          </Button>
        }
      >
        You need to set an Api Key before sending.
      </Alert>
      <ApiKeyDialog open={isOpen} onClose={() => setIsOpen(false)} />
    </Root>
  );
};

ApiKeyDialogWarningBase.displayName = 'ApiKeyDialogWarning';

export const ApiKeyDialogWarning = Wrap(ApiKeyDialogWarningBase);

export type ApiKeyDialogWarningProps = ComponentProps<
  typeof ApiKeyDialogWarning
>;
