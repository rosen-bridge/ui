import { ComponentProps } from 'react';

import { OverridableType } from '@/types';
import { Icon, IconButton, IconOverriddenProps } from '@/components';
import { ElementBaseProps, Root, Wrap } from '@/core';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CloseButtonOverrides {}

export type CloseButtonOwnProps = {
  slots?: {
    icon?: IconOverriddenProps;
  };
};

export type CloseButtonBaseProps = ElementBaseProps<
  typeof IconButton,
  CloseButtonOwnProps
>;

export type CloseButtonOverriddenProps = OverridableType<
  CloseButtonBaseProps,
  CloseButtonOverrides,
  never
>;

export const CloseButtonBase = ({
  slots,
  ...rest
}: CloseButtonOverriddenProps) => {
  return (
    <Root as={IconButton} {...rest}>
      <Icon name="Times" {...slots?.icon} />
    </Root>
  );
};

CloseButtonBase.displayName = 'CloseButton';

export const CloseButton = Wrap(CloseButtonBase);

export type CloseButtonProps = ComponentProps<typeof CloseButton>;
