import { ComponentProps, useState } from 'react';

import { ApiKeyDialog, Icon, IconButton } from '@/components';
import { ElementBaseProps, Root, Wrap } from '@/core';
import { OverridableType } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ApiKeyDialogButtonOverrides {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type ApiKeyDialogButtonOwnProps = {};

export type ApiKeyDialogButtonBaseProps = ElementBaseProps<
  typeof IconButton,
  ApiKeyDialogButtonOwnProps
>;

export type ApiKeyDialogButtonOverriddenProps = OverridableType<
  ApiKeyDialogButtonBaseProps,
  ApiKeyDialogButtonOverrides,
  never
>;

export const ApiKeyDialogButtonBase = ({
  ...rest
}: ApiKeyDialogButtonOverriddenProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Root
        as={IconButton}
        color="inherit"
        onClick={() => setIsOpen(true)}
        {...rest}
      >
        <Icon name="KeySkeleton" />
      </Root>
      <ApiKeyDialog open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

ApiKeyDialogButtonBase.displayName = 'ApiKeyDialogButton';

export const ApiKeyDialogButton = Wrap(ApiKeyDialogButtonBase);

export type ApiKeyDialogButtonProps = ComponentProps<typeof ApiKeyDialogButton>;
