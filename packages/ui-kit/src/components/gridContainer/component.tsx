import { useMemo } from 'react';

import { useConfig } from '@/hooks';
import { ElementBaseProps, Gap, OverridableType, Width } from '@/types';
import { toCSSUnit } from '@/utils';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GridContainerOverrides {}

export type GridContainerOwnProps = {
  /**
   * The gap between grid items.
   * If a number is provided, it will be interpreted as pixels (`px`).
   * You can also pass a CSS length string like `"1rem"` or `"2em"`.
   *
   * @default 0
   */
  gap?: Gap;

  /**
   * The minimum width of each grid column.
   * You can also pass a CSS length string.
   */
  minWidth?: Width;
};

export type GridContainerBaseProps = ElementBaseProps<
  'div',
  GridContainerOwnProps
>;

export type GridContainerProps = OverridableType<
  GridContainerBaseProps,
  GridContainerOverrides,
  'gap' | 'minWidth'
>;

/**
 * `GridContainer` is a flexible grid layout component.
 * It automatically arranges its children into responsive columns
 * based on the `minWidth` and `gap` props.
 *
 * This is useful for layouts like card grids or product listings
 * that should adapt to different screen sizes.
 *
 * @example
 * ```tsx
 * <GridContainer gap={16} minWidth={240}>
 *   <Card />
 *   <Card />
 *   <Card />
 * </GridContainer>
 * ```
 */
export const GridContainer = (props: GridContainerProps) => {
  const { gap, minWidth, style, ...rest } = useConfig('GridContainer', props);

  const styles = useMemo(
    () => ({
      gap: toCSSUnit('gap', gap),
      gridTemplateColumns: `repeat(auto-fill, minmax(${toCSSUnit('width', minWidth)}, 1fr))`,
      ...style,
    }),
    [gap, minWidth, style],
  );

  return <div style={styles} {...rest} />;
};

GridContainer.displayName = 'GridContainer';
