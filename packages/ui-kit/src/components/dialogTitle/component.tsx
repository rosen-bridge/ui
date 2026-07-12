import { Typography, type TypographyProps } from '@/components';
import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

export interface DialogTitleOverrides {}

export type DialogTitleOwnProps = TypographyProps & {};

export type DialogTitleBaseProps = ElementBaseProps<
  typeof Typography,
  DialogTitleOwnProps
>;

export type DialogTitleProps = OverridableType<
  DialogTitleBaseProps,
  DialogTitleOverrides,
  never
>;

export const DialogTitle = (props: DialogTitleProps) => {
  const { ...rest } = useConfig('DialogTitle', props);

  return <Typography component="h2" {...rest} />;
};

DialogTitle.displayName = 'DialogTitle';
