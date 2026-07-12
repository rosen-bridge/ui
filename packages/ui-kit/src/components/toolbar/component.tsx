import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

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

export const Toolbar = (props: ToolbarProps) => {
  const { ...rest } = useConfig('Toolbar', props);

  return <div {...rest} />;
};

Toolbar.displayName = 'Toolbar';
