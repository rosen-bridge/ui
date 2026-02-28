import { ComponentProps } from 'react';

import { GapOverridden, OverridableType } from '../../@types';
import { ElementPropsBase, Root, Wrap } from '../../core';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GridContainerOverrides {}

export type GridContainerPropsBase = {
  /**
   * The gap between grid items.
   * If a number is provided, it will be interpreted as pixels (`px`).
   * You can also pass a CSS length string like `"1rem"` or `"2em"`.
   *
   * @default 0
   */
  gap?: GapOverridden;

  /**
   * The minimum width of each grid column.
   * If a number is provided, it will be interpreted as pixels (`px`).
   * You can also pass a CSS length string.
   */
  minWidth?: number | string;
} & ElementPropsBase<'div'>;

export type GridContainerPropsBaseOverridden = OverridableType<
  GridContainerPropsBase,
  GridContainerOverrides,
  'gap'
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
export const GridContainerBase = ({
  gap,
  minWidth,
  ...rest
}: GridContainerPropsBaseOverridden) => {
  const styles = {
    gap,
    gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}, 1fr))`,
  }
  return <Root styles={styles} {...rest} />;
};

GridContainerBase.displayName = 'GridContainer';

export const GridContainer = Wrap(GridContainerBase);

export type GridContainerProps = ComponentProps<typeof GridContainer>;
