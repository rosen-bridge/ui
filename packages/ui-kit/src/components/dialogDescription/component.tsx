import { Typography } from '@/components';
import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

export interface DialogDescriptionOverrides {}

export type DialogDescriptionOwnProps = {};

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

  return <Typography data-surface="description" {...rest} />;
};

DialogDescription.displayName = 'DialogDescription';
