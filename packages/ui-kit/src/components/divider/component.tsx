import { useMemo } from 'react';

import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';
import { toCSSUnit } from '@/utils';

import './styles.css';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DividerOverrides {}

export type DividerOwnProps = {
  borderStyle?: 'dashed' | 'solid';

  flexItem?: boolean;

  orientation?: 'horizontal' | 'vertical';

  placement?: 'left';

  thickness?: string | number;

  variant?: 'full' | 'inset' | 'middle';
};

export type DividerBaseProps = ElementBaseProps<'div', DividerOwnProps>;

export type DividerProps = OverridableType<DividerBaseProps, DividerOverrides, never>;

export const Divider = (props: DividerProps) => {
  const {
    children,
    borderStyle = 'solid',
    flexItem,
    orientation = 'horizontal',
    placement = 'left',
    style,
    thickness = '1px',
    variant = 'full',
    ...rest
  } = useConfig('Divider', props);

  const hasChildren = !!children;

  const styles = useMemo(
    () => ({
      '--divider-thickness': toCSSUnit('thickness-size', thickness),
      '--divider-border-style': borderStyle,
      ...style,
    }),
    [thickness, borderStyle, style],
  );

  return (
    <div
      data-flex-item={flexItem}
      data-variant={variant}
      data-orientation={orientation}
      data-placement={hasChildren ? placement : undefined}
      data-has-children={hasChildren}
      style={styles}
      {...rest}
    >
      {hasChildren && <span className="RosenDivider-content">{children}</span>}
    </div>
  );
};

Divider.displayName = 'Divider';
