import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

import { Icon, IconProps } from '../icon';
import { IconButton } from '../iconButton';

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

export const CloseButton = (props: CloseButtonProps) => {
  const { slots, ...rest } = useConfig('CloseButton', props);

  return (
    <IconButton {...rest}>
      <Icon name="Times" {...slots?.icon} />
    </IconButton>
  );
};

CloseButton.displayName = 'CloseButton';
