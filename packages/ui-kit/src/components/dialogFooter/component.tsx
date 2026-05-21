import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DialogFooterOverrides {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
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
