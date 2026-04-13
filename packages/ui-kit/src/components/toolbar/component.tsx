import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ToolbarOverrides {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type ToolbarOwnProps = {};

export type ToolbarBaseProps = ElementBaseProps<'div', ToolbarOwnProps>;

export type ToolbarProps = OverridableType<
  ToolbarBaseProps,
  ToolbarOverrides,
  never
>;

export const ToolbarBase = ({ ...rest }: ToolbarProps) => {
  return <div {...rest} />;
};

ToolbarBase.displayName = 'Toolbar';

export const Toolbar = Wrap(ToolbarBase);
