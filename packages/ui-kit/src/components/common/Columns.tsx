import { ReactNode } from 'react';

import { Box } from '../base';

type ColumnsProps = {
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
  width: string;
};

/**
 * `Columns` is a simple utility component for creating a multi-column layout.
 * It uses CSS columns to automatically split children into multiple columns,
 * with configurable column width, gap, and an optional dividing rule.
 */
export const Columns = ({ children, gap, rule, width }: ColumnsProps) => {
  return (
    <Box
      sx={{
        'columnWidth': width,
        'columnGap': gap,
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
