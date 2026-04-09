import { ComponentProps } from 'react';

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

export type CardTitleOverriddenProps = OverridableType<
  CardTitleBaseProps,
  CardTitleOverrides,
  never
>;

export const CardTitleBase = ({ ...rest }: CardTitleOverriddenProps) => {
  return <Typography {...rest} />;
};

CardTitleBase.displayName = 'CardTitle';

export const CardTitle = Wrap(CardTitleBase);

export type CardTitleProps = ComponentProps<typeof CardTitle>;
