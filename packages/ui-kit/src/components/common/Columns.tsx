import { ReactNode } from 'react';

import { Box } from '../base';
import { InjectOverrides } from './InjectOverrides';

export type ColumnsProps = {
  /**
   * The content elements to display inside the columns.
   */
  children?: ReactNode;

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

  /**
   * The count.
   * To specify the desired column
   */
  count?: number;
};

/**
 * `Columns` is a simple utility component for creating a multi-column layout.
 * It uses CSS columns to automatically split children into multiple columns,
 * with configurable column width, gap, and an optional dividing rule.
 */
const ColumnsBase = ({ children, gap, rule, width, count }: ColumnsProps) => {
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
    >
      {children}
    </Box>
  );
};

export const Columns = InjectOverrides(ColumnsBase);
