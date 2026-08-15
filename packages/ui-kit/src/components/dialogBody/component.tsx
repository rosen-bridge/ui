import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

export interface DialogBodyOverrides {}

export type DialogBodyOwnProps = {};

export type DialogBodyBaseProps = ElementBaseProps<'div', DialogBodyOwnProps>;

export type DialogBodyProps = OverridableType<DialogBodyBaseProps, DialogBodyOverrides, never>;

export const DialogBody = (props: DialogBodyProps) => {
  const { ...rest } = useConfig('DialogBody', props);

  return <div {...rest} />;
};

DialogBody.displayName = 'DialogBody';
