import { Icon, IconButton, type IconProps } from '@/components';
import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

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

export const CloseButton = (props: CloseButtonProps) => {
  const { slots, ...rest } = useConfig('CloseButton', props);

  return (
    <IconButton {...rest}>
      <Icon name="Times" {...slots?.icon} />
    </IconButton>
  );
};

CloseButton.displayName = 'CloseButton';
