import { HTMLAttributes } from 'react';

import { Box } from '../base';
import { InjectOverrides } from './InjectOverrides';

export type ColumnsProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * The count.
   * To specify the desired column
   */
  count?: number;

  /**
   * The gap between columns.
   * Accepts any valid CSS length, e.g. `'1rem'` or `'16px'`.
   */
  gap?: string;

  /**
   * Whether to show a dividing line (`columnRule`) between columns.
   */
  rule?: boolean;

  /**
   * The minimum column width.
   * Determines how wide each column can be.
   * Accepts any valid CSS length, e.g. `'240px'`.
   */
  width?: string;
};

/**
 * `Columns` is a simple utility component for creating a multi-column layout.
 * It uses CSS columns to automatically split children into multiple columns,
 * with configurable column width, gap, and an optional dividing rule.
 */
const ColumnsBase = ({
  count,
  children,
  gap,
  rule,
  width,
  ...props
}: ColumnsProps) => {
  return (
    <Box
      sx={{
        'columnWidth': width,
        'columnGap': gap,
        'columnCount': count || 'auto',
        'columnRule': (theme) =>
          rule ? `1px dashed ${theme.palette.divider}` : '',
        '& > *': {
          breakInside: 'avoid',
        },
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export const Columns = InjectOverrides(ColumnsBase);
