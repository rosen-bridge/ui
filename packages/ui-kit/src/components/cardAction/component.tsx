import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

export interface CardActionOverrides {}

export type CardActionOwnProps = {};

export type CardActionBaseProps = ElementBaseProps<'div', CardActionOwnProps>;

export type CardActionProps = OverridableType<CardActionBaseProps, CardActionOverrides, never>;

export const CardAction = (props: CardActionProps) => {
  const { ...rest } = useConfig('CardAction', props);

  return <div data-surface="action" {...rest} />;
};

CardAction.displayName = 'CardAction';
