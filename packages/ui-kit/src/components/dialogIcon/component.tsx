import { Icon } from '@/components';
import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

export interface DialogIconOverrides {}

export type DialogIconOwnProps = {};

export type DialogIconBaseProps = ElementBaseProps<typeof Icon, DialogIconOwnProps>;

export type DialogIconProps = OverridableType<DialogIconBaseProps, DialogIconOverrides, never>;

export const DialogIcon = (props: DialogIconProps) => {
  const { ...rest } = useConfig('DialogIcon', props);

  return <Icon {...rest} />;
};

DialogIcon.displayName = 'DialogIcon';
