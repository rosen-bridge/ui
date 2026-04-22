import { useMemo } from 'react';

import { useConfig } from '@/hooks';
import { ElementBaseProps, Gap, OverridableType, Width } from '@/types';
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
  gap?: Gap;

  /**
   * Whether to show a dividing line (`columnRule`) between columns.
   */
  rule?: boolean;

  /**
   * The minimum column width.
   * Determines how wide each column can be.
   * Accepts any valid CSS length, e.g. `'240px'`.
   */
  width?: Width;
};

export type ColumnsBaseProps = ElementBaseProps<'div', ColumnsOwnProps>;

export type ColumnsProps = OverridableType<
  ColumnsBaseProps,
  ColumnsOverrides,
  'gap' | 'width'
>;

/**
 * `Columns` is a simple utility component for creating a multi-column layout.
 * It uses CSS columns to automatically split children into multiple columns,
 * with configurable column width, gap, and an optional dividing rule.
 */
export const Columns = (props: ColumnsProps) => {
  const { count, gap, rule, style, width, ...rest } = useConfig(
    'Columns',
    props,
  );

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

Columns.displayName = 'Columns';
