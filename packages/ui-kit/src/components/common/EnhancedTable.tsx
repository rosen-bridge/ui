import { ReactNode } from 'react';
import { Breakpoint } from '@mui/material';

import {
  Table as MuiTable,
  TableContainer,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  TablePagination,
  TablePaginationProps as MuiTablePaginationProps,
  Box,
  TableFooter,
  TableCellProps,
} from '../base';

import { useResponsiveValue } from '../../hooks';

import type { ResponsiveValueOptionsBase } from '../../@types';

export interface TableHeadItem {
  cellProps?: TableCellProps;
  title?: string;
}

export type TableResponsiveHead<
  MandatoryBreakpoint extends Breakpoint = 'mobile',
> = {
  [Key in MandatoryBreakpoint]: TableHeadItem[];
} & ResponsiveValueOptionsBase<TableHeadItem[]>;

export type TableRowRenderProp<
  T,
  MandatoryBreakpoint extends Breakpoint = 'mobile',
> = {
  [Key in MandatoryBreakpoint]: (rowData: T) => ReactNode;
} & ResponsiveValueOptionsBase<(rowData: T) => ReactNode>;

type PaginatedTableProps = {
  paginated: true;
  tablePaginationProps: MuiTablePaginationProps;
};

type NotPaginatedTableProps = {
  paginated: false;
};

type TablePaginationProps = PaginatedTableProps | NotPaginatedTableProps;

export type EnhancedTableProps<Row> = {
  responsiveHead: TableResponsiveHead;
  responsiveRenderRow: TableRowRenderProp<Row>;
  data: Row[];
} & TablePaginationProps;

/**
 * renders an enhanced version of material ui table that handles responsive values and
 * pagination
 *
 * @param {Row[]} data - list of rows that should be rendered in the table
 *
 * @param {TableResponsiveHead} responsiveHead -this prop is used to define the table header.
 *  this prop takes an object with the theme breakpoints as its keys and a list of TableHeadItems as
 *  its value, the correct value will be rendered based on the current screen size.
 *
 *  this object required to have the mobile template to be used as fallback for other screen sizes
 *  if they are not provided in the object
 *
 * @param {TableRowRenderProp<Row>} responsiveRenderRow -this prop is used to render Table Rows.
 *  this prop takes an object with the theme breakpoints as its keys and a list of render functions as
 *  its value, the correct function will be used to render the row  based on the current screen size.
 *
 *  this object required to have the mobile render function to be used as fallback for other screen sizes
 *  if they are not provided in the object
 *
 * @param {boolean} paginated - if true the table pagination will be rendered in table
 *  and the user should provide other props needed by the TablePagination to handle pagination
 *
 * @param  {MuiTablePaginationProps} tablePaginationProps - if paginated is equal to true, this object should be provided
 *  to config and manage the table pagination
 */

export const EnhancedTable = <Row,>(props: EnhancedTableProps<Row>) => {
  const { data, responsiveRenderRow, responsiveHead, paginated } = props;

  const tableHead = useResponsiveValue(responsiveHead);

  const renderRow = useResponsiveValue(responsiveRenderRow);

  const renderHead = () => (
    <TableHead>
      <TableRow>
        {tableHead.map((headItem) => (
          <TableCell {...(headItem.cellProps ? headItem.cellProps : {})}>
            {headItem.title}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );

  const renderBody = () => <TableBody>{data.map(renderRow)}</TableBody>;

  const renderFooter = () =>
    paginated ? (
      <TableFooter>
        <TableCell colSpan={tableHead.length} padding="none">
          <Box py={1}>
            <TablePagination {...props.tablePaginationProps} />
          </Box>
        </TableCell>
      </TableFooter>
    ) : null;

  return (
    <TableContainer>
      <MuiTable>
        {renderHead()}
        {renderBody()}
        {renderFooter()}
      </MuiTable>
    </TableContainer>
  );
};
