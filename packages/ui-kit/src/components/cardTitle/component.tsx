import { Text, type TextProps } from '@/components';
import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

export interface CardTitleOverrides {}

export type CardTitleOwnProps = TextProps & {};

export type CardTitleBaseProps = ElementBaseProps<typeof Text, CardTitleOwnProps>;

export type CardTitleProps = OverridableType<CardTitleBaseProps, CardTitleOverrides, never>;

export const CardTitle = (props: CardTitleProps) => {
  const { ...rest } = useConfig('CardTitle', props);

  return <Text data-surface="title" {...rest} />;
};

CardTitle.displayName = 'CardTitle';
