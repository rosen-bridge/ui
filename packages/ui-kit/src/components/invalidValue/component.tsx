import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

export interface InvalidValueOverrides {}

export type InvalidValueOwnProps = {
  label?: string;
};

export type InvalidValueBaseProps = ElementBaseProps<'span', InvalidValueOwnProps>;

export type InvalidValueProps = OverridableType<
  InvalidValueBaseProps,
  InvalidValueOverrides,
  never
>;

export const InvalidValue = (props: InvalidValueProps) => {
  const { children, label = 'Invalid', ...rest } = useConfig('InvalidValue', props);

  return <span {...rest}>{children ?? label}</span>;
};

InvalidValue.displayName = 'InvalidValue';
