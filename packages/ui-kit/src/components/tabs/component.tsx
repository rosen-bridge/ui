import { useMemo } from 'react';

import { Tabs as TabsBaseUI } from '@base-ui/react/tabs';

import { ElementBaseProps, Wrap } from '@/core';
import { Gap, OverridableType } from '@/types';
import { toCSSUnit } from '@/utils';

import './styles.scss';

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

export const TabsBase = ({
  gap,
  style,
  value,
  onChange,
  ...rest
}: TabsProps) => {
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

TabsBase.displayName = 'Tabs';

export const Tabs = Wrap(TabsBase);
