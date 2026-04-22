import { Typography, TypographyProps } from '@/components';
import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
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
