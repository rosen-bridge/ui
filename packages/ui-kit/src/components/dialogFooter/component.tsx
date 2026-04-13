import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

import './styles.scss';

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

export const DialogFooterBase = ({ ...rest }: DialogFooterProps) => {
  return <div {...rest} />;
};

DialogFooterBase.displayName = 'DialogFooter';

export const DialogFooter = Wrap(DialogFooterBase);
