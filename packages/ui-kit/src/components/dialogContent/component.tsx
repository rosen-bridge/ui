import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DialogContentOverrides {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
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

export const DialogContentBase = ({ ...rest }: DialogContentProps) => {
  return <div {...rest} />;
};

DialogContentBase.displayName = 'DialogContent';

export const DialogContent = Wrap(DialogContentBase);
