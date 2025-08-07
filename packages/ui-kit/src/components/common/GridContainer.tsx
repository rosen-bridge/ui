import React, { useMemo } from 'react';

/**
 * Props for the `GridContainer` component.
 *
 * @property children - The React elements to be rendered inside the grid.
 * @property gap - The gap between grid items.
 * Can be a number (interpreted as `px`) or any valid CSS string (e.g., "1rem", "2em").
 * @example gap={16} // 16px gap
 * @example gap="1rem"
 * @property minWidth - The minimum width of each grid column.
 * Can be a number (interpreted as `px`) or a valid CSS string.
 * Determines how wide each column can grow before wrapping.
 * @example minWidth={240} // 240px min column width
 * @example minWidth="20em"
 */
type GridContainerProps = {
  /**
   * The React elements to render inside the grid.
   */
  children?: React.ReactNode;

  /**
   * The gap between grid items.
   * If a number is provided, it will be interpreted as pixels (`px`).
   * You can also pass a CSS length string like `"1rem"` or `"2em"`.
   *
   * @default 0
   */
  gap?: number | string;

  /**
   * The minimum width of each grid column.
   * If a number is provided, it will be interpreted as pixels (`px`).
   * You can also pass a CSS length string.
   */
  minWidth: number | string;
};

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
export const GridContainer = ({
  children,
  gap,
  minWidth,
}: GridContainerProps) => {
  const styles = useMemo(() => {
    const resolvedGap = typeof gap === 'number' ? `${gap}px` : gap;
    const resolvedMinWidth =
      typeof minWidth === 'number' ? `${minWidth}px` : minWidth;

    return {
      display: 'grid',
      width: '100%',
      gap: resolvedGap,
      gridTemplateColumns: `repeat(auto-fill, minmax(${resolvedMinWidth}, 1fr))`,
    };
  }, [gap, minWidth]);

  return <div style={styles}>{children}</div>;
};
