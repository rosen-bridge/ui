import { ComponentProps, HTMLAttributes } from 'react';

import { GapOverridden, OverridableType } from '../../@types';
import { Wrap } from '../../core';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GridContainerOverrides {}

export type GridContainerPropsBase = HTMLAttributes<HTMLDivElement> & {
  gap?: GapOverridden;
  minWidth?: number | string;
};

export type GridContainerPropsBaseOverridden = OverridableType<
  GridContainerPropsBase,
  GridContainerOverrides,
  'gap'
>;

export const GridContainerBase = ({
  gap,
  minWidth,
  ...rest
}: GridContainerPropsBaseOverridden) => {
  void gap;
  void minWidth;

  return <div {...rest} />;
};

GridContainerBase.displayName = 'GridContainer';

export const GridContainer = Wrap(GridContainerBase);

export type GridContainerProps = ComponentProps<typeof GridContainer>;
