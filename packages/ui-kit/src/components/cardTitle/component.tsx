import { Typography } from '@/components';
import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CardTitleOverrides {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type CardTitleOwnProps = {};

export type CardTitleBaseProps = ElementBaseProps<
  typeof Typography,
  CardTitleOwnProps
>;

export type CardTitleProps = OverridableType<
  CardTitleBaseProps,
  CardTitleOverrides,
  never
>;

export const CardTitleBase = ({ ...rest }: CardTitleProps) => {
  return <Typography {...rest} />;
};

CardTitleBase.displayName = 'CardTitle';

export const CardTitle = Wrap(CardTitleBase);
