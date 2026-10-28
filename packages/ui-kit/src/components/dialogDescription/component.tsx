import { Text, type TextProps } from '@/components';
import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

export interface DialogDescriptionOverrides {}

export type DialogDescriptionOwnProps = TextProps & {};

export type DialogDescriptionBaseProps = ElementBaseProps<typeof Text, DialogDescriptionOwnProps>;

export type DialogDescriptionProps = OverridableType<
  DialogDescriptionBaseProps,
  DialogDescriptionOverrides,
  never
>;

export const DialogDescription = (props: DialogDescriptionProps) => {
  const { ...rest } = useConfig('DialogDescription', props);

  return <Text as="p" data-surface="description" {...rest} />;
};

DialogDescription.displayName = 'DialogDescription';
