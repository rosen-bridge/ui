import { ComponentProps, useMemo } from 'react';

import { ElementBaseProps, Wrap } from '@/core';
import { GapOverridden, OverridableType, WidthOverridden } from '@/types';
import { toCSSUnit } from '@/utils';

import './styles.scss';

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
  width?: WidthOverridden;
};

export type ColumnsBaseProps = ElementBaseProps<'div', ColumnsOwnProps>;

export type ColumnsOverriddenProps = OverridableType<
  ColumnsBaseProps,
  ColumnsOverrides,
  'gap' | 'width'
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
  style,
  width,
  ...rest
}: ColumnsOverriddenProps) => {
  const styles = useMemo(
    () => ({
      columnWidth: toCSSUnit('width', width),
      columnGap: toCSSUnit('gap', gap),
      columnCount: count || 'auto',
      ...style,
    }),
    [style],
  );

  return <div data-rule={!!rule} style={styles} {...rest} />;
};

ColumnsBase.displayName = 'Columns';

export const Columns = Wrap(ColumnsBase);

export type ColumnsProps = ComponentProps<typeof Columns>;
