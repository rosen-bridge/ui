import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

export interface CardBodyOverrides {}

export type CardBodyOwnProps = {};

export type CardBodyBaseProps = ElementBaseProps<'div', CardBodyOwnProps>;

export type CardBodyProps = OverridableType<CardBodyBaseProps, CardBodyOverrides, never>;

export const CardBody = (props: CardBodyProps) => {
  const { ...rest } = useConfig('CardBody', props);

  return <div data-surface="body" {...rest} />;
};

CardBody.displayName = 'CardBody';
