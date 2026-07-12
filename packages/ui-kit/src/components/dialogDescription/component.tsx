import { Typography, type TypographyProps } from '@/components';
import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

export interface DialogDescriptionOverrides {}

export type DialogDescriptionOwnProps = TypographyProps & {};

export type DialogDescriptionBaseProps = ElementBaseProps<
  typeof Typography,
  DialogDescriptionOwnProps
>;

export type DialogDescriptionProps = OverridableType<
  DialogDescriptionBaseProps,
  DialogDescriptionOverrides,
  never
>;

export const DialogDescription = (props: DialogDescriptionProps) => {
  const { ...rest } = useConfig('DialogDescription', props);

  return <Typography component="p" {...rest} />;
};

DialogDescription.displayName = 'DialogDescription';
