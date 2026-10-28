import { Text, type TextProps } from '@/components';
import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

export interface DialogTitleOverrides {}

export type DialogTitleOwnProps = TextProps & {};

export type DialogTitleBaseProps = ElementBaseProps<typeof Text, DialogTitleOwnProps>;

export type DialogTitleProps = OverridableType<DialogTitleBaseProps, DialogTitleOverrides, never>;

export const DialogTitle = (props: DialogTitleProps) => {
  const { ...rest } = useConfig('DialogTitle', props);

  return <Text as="h3" data-surface="title" {...rest} />;
};

DialogTitle.displayName = 'DialogTitle';
