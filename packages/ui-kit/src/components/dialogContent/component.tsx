import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

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

export const DialogContent = (props: DialogContentProps) => {
  const { ...rest } = useConfig('DialogContent', props);

  return <div {...rest} />;
};

DialogContent.displayName = 'DialogContent';
