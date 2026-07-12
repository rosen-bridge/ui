import { useState } from 'react';

import { ApiKeyDialog, Icon, IconButton } from '@/components';
import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ApiKeyDialogButtonOverrides {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type ApiKeyDialogButtonOwnProps = {};

export type ApiKeyDialogButtonBaseProps = ElementBaseProps<
  typeof IconButton,
  ApiKeyDialogButtonOwnProps
>;

export type ApiKeyDialogButtonProps = OverridableType<
  ApiKeyDialogButtonBaseProps,
  ApiKeyDialogButtonOverrides,
  never
>;

export const ApiKeyDialogButton = (props: ApiKeyDialogButtonProps) => {
  const { ...rest } = useConfig('ApiKeyDialogButton', props);

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <IconButton color="inherit" onClick={() => setIsOpen(true)} {...rest}>
        <Icon name="KeySkeleton" />
      </IconButton>
      <ApiKeyDialog open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

ApiKeyDialogButton.displayName = 'ApiKeyDialogButton';
