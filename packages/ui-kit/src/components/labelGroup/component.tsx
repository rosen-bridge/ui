import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

export interface LabelGroupOverrides {}

export type LabelGroupOwnProps = {};

export type LabelGroupBaseProps = ElementBaseProps<'div', LabelGroupOwnProps>;

export type LabelGroupProps = OverridableType<
  LabelGroupBaseProps,
  LabelGroupOverrides,
  never
>;

export const LabelGroup = (props: LabelGroupProps) => {
  const { ...rest } = useConfig('LabelGroup', props);

  return <div {...rest} />;
};

LabelGroup.displayName = 'LabelGroup';
