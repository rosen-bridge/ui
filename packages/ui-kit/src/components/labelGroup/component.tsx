import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LabelGroupOverrides {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type LabelGroupOwnProps = {};

export type LabelGroupBaseProps = ElementBaseProps<'div', LabelGroupOwnProps>;

export type LabelGroupProps = OverridableType<
  LabelGroupBaseProps,
  LabelGroupOverrides,
  never
>;

export const LabelGroupBase = ({ ...rest }: LabelGroupProps) => {
  return <div {...rest} />;
};

LabelGroupBase.displayName = 'LabelGroup';

export const LabelGroup = Wrap(LabelGroupBase);
