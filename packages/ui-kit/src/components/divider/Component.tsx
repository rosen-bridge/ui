import { useMemo } from 'react';

import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';
import { toCSSUnit } from '@/utils';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DividerOverrides {}

export type DividerOwnProps = {
  borderStyle?: 'dashed' | 'solid';
  orientation?: 'horizontal' | 'vertical';
  placement?: 'left';
  thickness?: string;
  variant?: 'full' | 'inset' | 'middle';
};

export type DividerBaseProps = ElementBaseProps<'div', DividerOwnProps>;

export type DividerProps = OverridableType<
  DividerBaseProps,
  DividerOverrides,
  never
>;

export const Divider = (props: DividerProps) => {
  const {
    orientation = 'horizontal',
    borderStyle = 'solid',
    thickness = '1px',
    placement = 'left',
    children,
    variant = 'fullWidth',
    className,
    style,
    ...rest
  } = useConfig('Divider', props);

  const styles = useMemo(
    () => ({
      '--rosen-divider-thickness': toCSSUnit('border-width', thickness),
      ...style,
    }),
    [thickness, style],
  );

  return (
    <div
      role="separator"
      data-orientation={orientation}
      data-variant={variant}
      data-text-align={placement}
      data-border-style={borderStyle}
      data-with-children={!!children || undefined}
      className={className}
      style={styles}
      {...rest}
    >
      {children && <span className="RosenDivider-label">{children}</span>}
    </div>
  );
};

Divider.displayName = 'Divider';
