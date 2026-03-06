import { ComponentProps } from 'react';

import { GapOverridden, OverridableType, WidthOverridden } from '../../@types';
import { ElementBaseProps, Root, Wrap } from '../../core';
import { toCSSUnit } from '../../utils';

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
  gap?: GapOverridden;

  /**
   * The minimum width of each grid column.
   * You can also pass a CSS length string.
   */
  minWidth?: WidthOverridden;
};

export type GridContainerBaseProps = ElementBaseProps<
  'div',
  GridContainerOwnProps
>;

export type GridContainerOverriddenProps = OverridableType<
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
export const GridContainerBase = ({
  gap,
  minWidth,
  ...rest
}: GridContainerOverriddenProps) => {
  const styles = {
    gap: toCSSUnit('gap', gap),
    gridTemplateColumns: `repeat(auto-fill, minmax(${toCSSUnit('width', minWidth)}, 1fr))`,
  };
  return <Root styles={styles} {...rest} />;
};

GridContainerBase.displayName = 'GridContainer';

export const GridContainer = Wrap(GridContainerBase);

export type GridContainerProps = ComponentProps<typeof GridContainer>;
