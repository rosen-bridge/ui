import { type CSSProperties, useMemo } from 'react';

import { useConfig } from '@/hooks';
import type { ElementBaseProps, Gap, OverridableType } from '@/types';
import { toCSSUnit } from '@/utils';

const ALIGN_MAP: Record<NonNullable<StackBaseProps['align']>, string> = {
  baseline: 'baseline',
  center: 'center',
  end: 'flex-end',
  start: 'flex-start',
  stretch: 'stretch',
};

const JUSTIFY_MAP: Record<NonNullable<StackBaseProps['justify']>, string> = {
  around: 'space-around',
  between: 'space-between',
  center: 'center',
  end: 'flex-end',
  evenly: 'space-evenly',
  start: 'flex-start',
};

export interface StackOverrides {}

export type StackOwnProps = {
  /** Defines how children are aligned along the cross-axis. */
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';

  /** Sets the main axis direction of the stack. */
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';

  /** Gap between child elements. */
  spacing?: Gap;

  /** If true, the Stack will use `display: inline-flex` instead of `flex`. */
  inline?: boolean;

  /** Controls distribution of space along the main axis. */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

  /** Whether children should wrap to the next line/column. */
  wrap?: boolean;
};

export type StackBaseProps = ElementBaseProps<'div', StackOwnProps>;

export type StackProps = OverridableType<
  StackBaseProps,
  StackOverrides,
  'spacing'
>;

/**
 * A flexible layout component based on CSS flexbox.
 *
 * Provides simple props for alignment, direction, gap,
 * wrapping, and justification of child elements.
 *
 * @example
 * <Stack direction="row" gap={2} justify="between">
 *   <Button>Left</Button>
 *   <Button>Right</Button>
 * </Stack>
 */
export const Stack = (props: StackProps) => {
  const {
    align,
    direction = 'column',
    spacing,
    inline,
    justify,
    wrap,
    style,
    ...rest
  } = useConfig('Stack', props);

  const styles = useMemo(
    () =>
      ({
        display: inline ? 'inline-flex' : 'flex',
        flexDirection: direction,
        flexWrap: wrap ? 'wrap' : 'nowrap',
        alignItems: align ? ALIGN_MAP[align] : undefined,
        justifyContent: justify ? JUSTIFY_MAP[justify] : undefined,
        gap: toCSSUnit('gap', spacing),
        ...style,
      }) as CSSProperties,
    [align, direction, spacing, inline, justify, wrap, style],
  );

  return <div style={styles} {...rest} />;
};

Stack.displayName = 'Stack';
