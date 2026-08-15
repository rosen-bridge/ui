import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

export interface CardHeaderOverrides {}

export type CardHeaderOwnProps = {};

export type CardHeaderBaseProps = ElementBaseProps<'div', CardHeaderOwnProps>;

export type CardHeaderProps = OverridableType<CardHeaderBaseProps, CardHeaderOverrides, never>;

export const CardHeader = (props: CardHeaderProps) => {
  const { ...rest } = useConfig('CardHeader', props);

  return <div {...rest} />;
};

CardHeader.displayName = 'CardHeader';
