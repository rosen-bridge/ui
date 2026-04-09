import { ComponentProps } from 'react';

import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CardHeaderOverrides {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type CardHeaderOwnProps = {};

export type CardHeaderBaseProps = ElementBaseProps<'div', CardHeaderOwnProps>;

export type CardHeaderOverriddenProps = OverridableType<
  CardHeaderBaseProps,
  CardHeaderOverrides,
  never
>;

export const CardHeaderBase = ({ ...rest }: CardHeaderOverriddenProps) => {
  return <div {...rest} />;
};

CardHeaderBase.displayName = 'CardHeader';

export const CardHeader = Wrap(CardHeaderBase);

export type CardHeaderProps = ComponentProps<typeof CardHeader>;
