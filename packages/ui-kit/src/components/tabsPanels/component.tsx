import { ComponentProps } from 'react';

import { ElementBaseProps, Root, Wrap } from '@/core';
import { OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TabsPanelsOverrides {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type TabsPanelsOwnProps = {};

export type TabsPanelsBaseProps = ElementBaseProps<'div', TabsPanelsOwnProps>;

export type TabsPanelsOverriddenProps = OverridableType<
  TabsPanelsBaseProps,
  TabsPanelsOverrides,
  never
>;

export const TabsPanelsBase = ({ ...rest }: TabsPanelsOverriddenProps) => {
  return (
    <Root {...rest} />
  );
};

TabsPanelsBase.displayName = 'TabsPanels';

export const TabsPanels = Wrap(TabsPanelsBase);

export type TabsPanelsProps = ComponentProps<typeof TabsPanels>;
