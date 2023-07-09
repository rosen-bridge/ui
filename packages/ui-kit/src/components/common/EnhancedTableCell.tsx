import { FC, useMemo } from 'react';
import { TableCell, TableCellProps } from '../base';

export interface EnhancedTableCellProps extends TableCellProps {
  isContained?: boolean;
  tooltipTitle?: string;
}

/**
 * this component renders a table cell with some additional props to handle
 * text over flow and other required properties in tables
 *
 * @param TableCellProps - this component accepts all the styles that can be passed to an mui Table Cell
 * @param isContained - determined if the component should hide the text overflow and render ellipsis
 *  it defaults to true
 */
export const EnhancedTableCell: FC<EnhancedTableCellProps> = (props) => {
  const { isContained = true, ...cellProps } = props;

  const cellStyles = useMemo(
    () => ({
      ...(isContained
        ? {
            textOverflow: 'ellipsis',
            overflow: 'hidden',
          }
        : {}),
    }),
    [isContained]
  );

  return <TableCell sx={cellStyles} {...cellProps} />;
};
