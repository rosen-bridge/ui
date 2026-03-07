import { ComponentProps } from 'react';

import { OverridableType } from '@/@types';
import { ElementBaseProps, Root, Wrap } from '@/core';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LabelGroupOverrides {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type LabelGroupOwnProps = {};

export type LabelGroupBaseProps = ElementBaseProps<'div', LabelGroupOwnProps>;

export type LabelGroupOverriddenProps = OverridableType<
  LabelGroupBaseProps,
  LabelGroupOverrides,
  never
>;

export const LabelGroupBase = ({ ...rest }: LabelGroupOverriddenProps) => {
  return <Root {...rest} />;
};

LabelGroupBase.displayName = 'LabelGroup';

export const LabelGroup = Wrap(LabelGroupBase);

export type LabelGroupProps = ComponentProps<typeof LabelGroup>;
