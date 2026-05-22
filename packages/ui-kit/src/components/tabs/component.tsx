import { useMemo } from 'react';

import { Tabs as TabsBaseUI } from '@base-ui/react/tabs';

import { useConfig } from '@/hooks';
import { ElementBaseProps, Gap, OverridableType } from '@/types';
import { toCSSUnit } from '@/utils';

import './styles.css';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TabsOverrides {}

export type TabsOwnProps = {
  gap?: Gap;
  orientation?: 'horizontal' | 'vertical';
  value?: number | string;
  onChange?: (value: number | string) => void;
};

export type TabsBaseProps = ElementBaseProps<'div', TabsOwnProps>;

export type TabsProps = OverridableType<TabsBaseProps, TabsOverrides, 'gap'>;

export const Tabs = (props: TabsProps) => {
  const { gap, style, value, onChange, ...rest } = useConfig('Tabs', props);

  const styles = useMemo(
    () => ({ gap: toCSSUnit('gap', gap), ...style }),
    [gap, style],
  );

  return (
    <TabsBaseUI.Root
      style={styles}
      value={value}
      onValueChange={(value) => onChange?.(value)}
      {...rest}
    />
  );
};

Tabs.displayName = 'Tabs';
