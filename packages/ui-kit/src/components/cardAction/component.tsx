import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CardActionOverrides {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type CardActionOwnProps = {};

export type CardActionBaseProps = ElementBaseProps<'div', CardActionOwnProps>;

export type CardActionProps = OverridableType<
  CardActionBaseProps,
  CardActionOverrides,
  never
>;

export const CardActionBase = ({ ...rest }: CardActionProps) => {
  return <div {...rest} />;
};

CardActionBase.displayName = 'CardAction';

export const CardAction = Wrap(CardActionBase);
