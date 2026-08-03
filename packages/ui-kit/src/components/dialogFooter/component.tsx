import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

export interface DialogFooterOverrides {}

export type DialogFooterOwnProps = {};

export type DialogFooterBaseProps = ElementBaseProps<
  'div',
  DialogFooterOwnProps
>;

export type DialogFooterProps = OverridableType<
  DialogFooterBaseProps,
  DialogFooterOverrides,
  never
>;

export const DialogFooter = (props: DialogFooterProps) => {
  const { ...rest } = useConfig('DialogFooter', props);

  return <div {...rest} />;
};

DialogFooter.displayName = 'DialogFooter';
