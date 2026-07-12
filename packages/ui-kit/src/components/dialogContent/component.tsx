import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

export interface DialogContentOverrides {}

export type DialogContentOwnProps = {};

export type DialogContentBaseProps = ElementBaseProps<
  'div',
  DialogContentOwnProps
>;

export type DialogContentProps = OverridableType<
  DialogContentBaseProps,
  DialogContentOverrides,
  never
>;

export const DialogContent = (props: DialogContentProps) => {
  const { ...rest } = useConfig('DialogContent', props);

  return <div {...rest} />;
};

DialogContent.displayName = 'DialogContent';
