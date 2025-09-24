import { ComponentProps, forwardRef, HTMLAttributes } from 'react';

import { Wrap } from '../../core';

/**
 * Props for the `GridContainer` component
 */
type GridContainerPropsBase = HTMLAttributes<HTMLDivElement> & {
  /**
   * The gap between grid items
   */
  gap?: number | string;
  /**
   * The minimum width of each grid column
   */
  minWidth: number | string;
};

/**
 * Is a flexible grid layout component
 */
const GridContainerBase = forwardRef<HTMLDivElement, GridContainerPropsBase>((props, ref) => {
  const { children, ...rest } = props;
  return (
    <div ref={ref} {...rest}>
      {children}
    </div>
  );
});

GridContainerBase.displayName = "GridContainer";

export const GridContainer = Wrap(GridContainerBase, {
  reflects: [
    {
      property: 'gap',
      parser: 'SIZE'
    },
    {
      property: 'minWidth',
      parser: 'SIZE'
    }
  ]
});

export type GridContainerProps = ComponentProps<typeof GridContainer>;
