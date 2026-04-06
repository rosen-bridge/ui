import { ComponentProps, useMemo, useState } from 'react';

import { Alert, ApiKeyDialog, Button } from '@/components';
import { ElementBaseProps, Wrap } from '@/core';
import { useApiKey } from '@/hooks';
import { OverridableType } from '@/types';

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
  style,
  ...rest
}: ApiKeyDialogWarningOverriddenProps) => {
  const { apiKey } = useApiKey();

  const [isOpen, setIsOpen] = useState(false);

  const styles = useMemo(
    () => ({ containerType: 'inline-size', ...style }),
    [style],
  );

  if (apiKey) return null;

  return (
    <div style={styles} {...rest}>
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
    </div>
  );
};

ApiKeyDialogWarningBase.displayName = 'ApiKeyDialogWarning';

export const ApiKeyDialogWarning = Wrap(ApiKeyDialogWarningBase);

export type ApiKeyDialogWarningProps = ComponentProps<
  typeof ApiKeyDialogWarning
>;
