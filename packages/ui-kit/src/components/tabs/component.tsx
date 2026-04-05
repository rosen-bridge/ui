import { ComponentProps } from 'react';

import { Tabs as TabsBaseUI } from '@base-ui/react/tabs';

import { ElementBaseProps, Root, Wrap } from '@/core';
import { GapOverridden, OverridableType } from '@/types';

import './styles.scss';
import { toCSSUnit } from '@/utils';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TabsOverrides {}

export type TabsOwnProps = {
  gap?: GapOverridden;
  orientation?: 'horizontal' | 'vertical';
  value?: number | string;
  onChange?: (value: number | string) => void
};

export type TabsBaseProps = ElementBaseProps<'div', TabsOwnProps>;

export type TabsOverriddenProps = OverridableType<
  TabsBaseProps,
  TabsOverrides,
  'gap'
>;

export const TabsBase = ({ gap, value, onChange, ...rest }: TabsOverriddenProps) => {
  return (
    <Root 
      as={TabsBaseUI.Root}
      styles={{ gap: toCSSUnit('gap', gap) }}
      value={value}
      onValueChange={(value) => onChange?.(value)}
      {...rest}
    />
  );
};

TabsBase.displayName = 'Tabs';

export const Tabs = Wrap(TabsBase);

export type TabsProps = ComponentProps<typeof Tabs>;
