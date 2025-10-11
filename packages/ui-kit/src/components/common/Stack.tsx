import { ComponentProps, forwardRef, HTMLAttributes, useMemo } from 'react';

import { useTheme } from '../../hooks';
import { InjectOverrides } from './InjectOverrides';

/**
 * Props for the Stack layout component.
 * Extends native div attributes with flexbox-related options
 * for alignment, direction, spacing, justification, and wrapping.
 */
type StackPropsBase = HTMLAttributes<HTMLDivElement> & {
  /** Defines how children are aligned along the cross-axis. */
  align?: 'start' | 'center' | 'end' | 'stretch';

  /** Sets the main axis direction of the stack. */
  direction?: 'row' | 'column';

  /** Controls distribution of space along the main axis. */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';

  /** Gap between child elements (number uses theme.spacing). */
  spacing?: number | string;

  /** Whether children should wrap to the next line/column. */
  wrap?: boolean;
};

const ALIGN_MAP: Record<NonNullable<StackPropsBase['align']>, string> = {
  center: 'center',
  end: 'flex-end',
  start: 'flex-start',
  stretch: 'stretch',
};

const JUSTIFY_MAP: Record<NonNullable<StackPropsBase['justify']>, string> = {
  around: 'space-around',
  between: 'space-between',
  center: 'center',
  end: 'flex-end',
  start: 'flex-start',
};

/**
 * A flexible layout component based on CSS flexbox.
 *
 * Provides simple props for alignment, direction, spacing,
 * wrapping, and justification of child elements.
 *
 * @example
 * <Stack direction="row" spacing={2} justify="between">
 *   <Button>Left</Button>
 *   <Button>Right</Button>
 * </Stack>
 */
const StackBase = forwardRef<HTMLDivElement, StackPropsBase>((props, ref) => {
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

  const styles = useMemo(
    () =>
      Object.assign(
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
      ),
    [align, direction, gap, justify, wrap, style],
  );

  return (
    <div ref={ref} style={styles} {...rest}>
      {children}
    </div>
  );
});

StackBase.displayName = 'Stack';

export const Stack = InjectOverrides(StackBase);

export type StackProps = ComponentProps<typeof Stack>;
