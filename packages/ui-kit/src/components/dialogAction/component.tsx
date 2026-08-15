import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

export interface DialogActionOverrides {}

export type DialogActionOwnProps = {};

export type DialogActionBaseProps = ElementBaseProps<'div', DialogActionOwnProps>;

export type DialogActionProps = OverridableType<
  DialogActionBaseProps,
  DialogActionOverrides,
  never
>;

export const DialogAction = (props: DialogActionProps) => {
  const { ...rest } = useConfig('DialogAction', props);

  return <div {...rest} />;
};

DialogAction.displayName = 'DialogAction';
