import { ComponentProps } from 'react';

import { GapOverridden, OverridableType } from '../../@types';
import { ElementBaseProps, Root, Wrap } from '../../core';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ColumnsOverrides {}

export type ColumnsOwnProps = {
  /**
   * The count.
   * To specify the desired column
   */
  count?: number;

  /**
   * The gap between columns.
   * Accepts any valid CSS length, e.g. `'1rem'` or `'16px'`.
   */
  gap?: GapOverridden;

  /**
   * Whether to show a dividing line (`columnRule`) between columns.
   */
  rule?: boolean;

  /**
   * The minimum column width.
   * Determines how wide each column can be.
   * Accepts any valid CSS length, e.g. `'240px'`.
   */
  width?: number | string;
};

export type ColumnsBaseProps = ElementBaseProps<'div', ColumnsOwnProps>;

export type ColumnsOverriddenProps = OverridableType<
  ColumnsBaseProps,
  ColumnsOverrides,
  'gap'
>;

/**
 * `Columns` is a simple utility component for creating a multi-column layout.
 * It uses CSS columns to automatically split children into multiple columns,
 * with configurable column width, gap, and an optional dividing rule.
 */
export const ColumnsBase = ({
  count,
  gap,
  rule,
  width,
  ...rest
}: ColumnsOverriddenProps) => {
  const styles = {
    columnWidth: width,
    columnGap: gap,
    columnCount: count || 'auto',
  }
  return <Root reflects={{ rule }} styles={styles} {...rest} />;
};

ColumnsBase.displayName = 'Columns';

export const Columns = Wrap(ColumnsBase);

export type ColumnsProps = ComponentProps<typeof Columns>;
