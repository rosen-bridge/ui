import { ComponentProps, forwardRef, HTMLAttributes, useMemo } from 'react';

import { Wrap } from '../core';
import { useTheme } from '../hooks';

/**
 * TODO
 */
type Stack2PropsBase = HTMLAttributes<HTMLDivElement> & {
  align?: 'start' | 'center' | 'end' | 'stretch';
  direction?: 'row' | 'column';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  spacing?: number | string;
  wrap?: boolean;
};

const ALIGN_MAP: Record<NonNullable<Stack2PropsBase['align']>, string> = {
  center: 'center',
  end: 'flex-end',
  start: 'flex-start',
  stretch: 'stretch',
};

const JUSTIFY_MAP: Record<NonNullable<Stack2PropsBase['justify']>, string> = {
  around: 'space-around',
  between: 'space-between',
  center: 'center',
  end: 'flex-end',
  start: 'flex-start',
};

/**
 * TODO
 */
const Stack2Base = forwardRef<HTMLDivElement, Stack2PropsBase>((props, ref) => {
  const {
    align,
    children,
    direction = 'column',
    justify,
    spacing,
    style,
    wrap,
    ...rest
  } = props;

  const theme = useTheme();

  const gap = useMemo(() => {
    if (spacing === undefined) return;

    if (typeof spacing === 'string') return spacing;

    return theme.spacing(spacing);
  }, [spacing, theme]);

  const styles = useMemo(() => Object.assign(
    {},
    {
      display: 'flex',
      flexDirection: direction,
      flexWrap: wrap ? 'wrap' : 'nowrap',
      alignItems: align ? ALIGN_MAP[align] : undefined,
      justifyContent: justify ? JUSTIFY_MAP[justify] : undefined,
      gap,
    },
    style,
  ), [align, direction, gap, justify, wrap, style]);

  return (
    <div ref={ref} style={styles} {...rest}>
      {children}
    </div>
  );
});

Stack2Base.displayName = 'Stack2';

export const Stack2 = Wrap(Stack2Base);

export type Stack2Props = ComponentProps<typeof Stack2>;
