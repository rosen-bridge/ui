import { Icon, IconButton, IconProps } from '@/components';
import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CloseButtonOverrides {}

export type CloseButtonOwnProps = {
  slots?: {
    icon?: IconProps;
  };
};

export type CloseButtonBaseProps = ElementBaseProps<
  typeof IconButton,
  CloseButtonOwnProps
>;

export type CloseButtonProps = OverridableType<
  CloseButtonBaseProps,
  CloseButtonOverrides,
  never
>;

export const CloseButtonBase = ({ slots, ...rest }: CloseButtonProps) => {
  return (
    <IconButton {...rest}>
      <Icon name="Times" {...slots?.icon} />
    </IconButton>
  );
};

CloseButtonBase.displayName = 'CloseButton';

export const CloseButton = Wrap(CloseButtonBase);
