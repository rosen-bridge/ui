import { ComponentProps, CSSProperties } from 'react';

import { ElementBaseProps, Root, Wrap } from '@/core';
import { GapOverridden, OverridableType } from '@/types';
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

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface StackOverrides {}

export type StackOwnProps = {
  /** Defines how children are aligned along the cross-axis. */
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';

  /** Sets the main axis direction of the stack. */
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';

  /** Gap between child elements. */
  spacing?: GapOverridden;

  /** If true, the Stack will use `display: inline-flex` instead of `flex`. */
  inline?: boolean;

  /** Controls distribution of space along the main axis. */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

  /** Whether children should wrap to the next line/column. */
  wrap?: boolean;
};

export type StackBaseProps = ElementBaseProps<'div', StackOwnProps>;

export type StackOverriddenProps = OverridableType<
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
export const StackBase = ({
  align,
  direction = 'column',
  spacing,
  inline,
  justify,
  wrap,
  ...rest
}: StackOverriddenProps) => {
  const styles = {
    display: inline ? 'inline-flex' : 'flex',
    flexDirection: direction,
    flexWrap: wrap ? 'wrap' : 'nowrap',
    alignItems: align ? ALIGN_MAP[align] : undefined,
    justifyContent: justify ? JUSTIFY_MAP[justify] : undefined,
    gap: toCSSUnit('gap', spacing),
  } as CSSProperties;
  return <Root styles={styles} {...rest} />;
};

StackBase.displayName = 'Stack';

export const Stack = Wrap(StackBase);

export type StackProps = ComponentProps<typeof Stack>;
