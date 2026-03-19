import { ComponentProps } from 'react';

import { OverridableType } from '@/types';
import { ElementBaseProps, Root, Wrap } from '@/core';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ToolbarOverrides {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type ToolbarOwnProps = {};

export type ToolbarBaseProps = ElementBaseProps<'div', ToolbarOwnProps>;

export type ToolbarOverriddenProps = OverridableType<
  ToolbarBaseProps,
  ToolbarOverrides,
  never
>;

export const ToolbarBase = ({ ...rest }: ToolbarOverriddenProps) => {
  return <Root {...rest} />;
};

ToolbarBase.displayName = 'Toolbar';

export const Toolbar = Wrap(ToolbarBase);

export type ToolbarProps = ComponentProps<typeof Toolbar>;
