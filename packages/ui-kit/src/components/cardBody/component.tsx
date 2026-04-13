import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CardBodyOverrides {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type CardBodyOwnProps = {};

export type CardBodyBaseProps = ElementBaseProps<'div', CardBodyOwnProps>;

export type CardBodyProps = OverridableType<
  CardBodyBaseProps,
  CardBodyOverrides,
  never
>;

export const CardBodyBase = ({ ...rest }: CardBodyProps) => {
  return <div {...rest} />;
};

CardBodyBase.displayName = 'CardBody';

export const CardBody = Wrap(CardBodyBase);
