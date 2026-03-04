import { ComponentProps } from 'react';
import { ElementBaseProps, Root, Wrap } from '../../core';
import { OverridableType } from '../../@types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LabelGroupOverrides { }

export type LabelGroupOwnProps = {};

export type LabelGroupBaseProps = ElementBaseProps<'div', LabelGroupOwnProps>;

export type LabelGroupOverriddenProps = OverridableType<
  LabelGroupBaseProps,
  LabelGroupOverrides,
  never
>;

export const LabelGroupBase = ({ ...rest }: LabelGroupOverriddenProps) => {
  return <Root {...rest} />
};

LabelGroupBase.displayName = 'LabelGroup';

export const LabelGroup = Wrap(LabelGroupBase);

export type LabelGroupProps = ComponentProps<typeof LabelGroup>;
