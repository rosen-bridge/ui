import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

export interface DialogHeaderOverrides {}

export type DialogHeaderOwnProps = {};

export type DialogHeaderBaseProps = ElementBaseProps<'div', DialogHeaderOwnProps>;

export type DialogHeaderProps = OverridableType<
  DialogHeaderBaseProps,
  DialogHeaderOverrides,
  never
>;

export const DialogHeader = (props: DialogHeaderProps) => {
  const { ...rest } = useConfig('DialogHeader', props);

  return <div {...rest} />;
};

DialogHeader.displayName = 'DialogHeader';
