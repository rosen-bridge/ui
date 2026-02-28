import { ComponentProps, HTMLAttributes, useMemo } from 'react';

import { GapOverridden, OverridableType } from '../../@types';
import { Wrap } from '../../core';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ColumnsOverrides {}

export type ColumnsPropsBase = HTMLAttributes<HTMLDivElement> & {
  count?: number;
  gap?: GapOverridden;
  rule?: boolean;
  width?: number | string;
};

export type ColumnsPropsBaseOverridden = OverridableType<
  ColumnsPropsBase,
  ColumnsOverrides,
  'gap'
>;

export const ColumnsBase = ({
  count,
  gap,
  rule,
  style,
  width,
  ...rest
}: ColumnsPropsBaseOverridden) => {
  void rule;

  const styles = useMemo(
    () =>
      Object.assign(
        {},
        {
          columnWidth: width,
          columnGap: gap,
          columnCount: count || 'auto',
        },
        style,
      ),
    [count, gap, style, width],
  );

  return <div style={styles} {...rest} />;
};

ColumnsBase.displayName = 'Columns';

export const Columns = Wrap(ColumnsBase);

export type ColumnsProps = ComponentProps<typeof Columns>;
