import { useState } from 'react';

import { ApiKeyDialog, Icon, IconButton } from '@/components';
import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

export interface ApiKeyDialogButtonOverrides {}

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
