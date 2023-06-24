import { ReactNode } from 'react';

import {
  Table as MuiTable,
  TableContainer,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  TablePagination,
  Box,
  TableFooter,
  TableCellProps,
} from '../base';

import { useIsMobile, useResponsiveValue, usePagination } from '../../hooks';

export interface TableHeadItem {
  cellProps?: TableCellProps;
  title?: string;
}

export interface EnhancedTableProps<Row> {
  desktopTableHead?: TableHeadItem[];
  laptopTableHead?: TableHeadItem[];
  tabletTableHead?: TableHeadItem[];
  mobileTableHead: TableHeadItem[];
  data: Row[];

  renderDesktopRow?: (rowData: Row) => ReactNode;
  renderLaptopRow?: (rowData: Row) => ReactNode;
  renderTabletRow?: (rowData: Row) => ReactNode;
  renderMobileRow: (rowData: Row) => ReactNode;

  paginated?: boolean;
  pageSize?: number;
  defaultPage?: number;
}

/**
 * renders an enhanced version of material ui table that handles responsive values and
 * pagination
 *
 * @param {Row[]} data - list of rows that should be rendered in the table
 *
 * @param {TableHeadItem[]} desktopTableHead - optional table header for desktop
 * if not provided falls back to other table headers
 * @param {TableHeadItem[]} laptopTableHead -  optional table header for laptop
 * if not provided falls back to tablet or mobile table header
 * @param {TableHeadItem[]} tabletTableHead -  optional table header for tablet
 * if not provided falls back to mobile table header
 * @param {TableHeadItem[]} mobileTableHead -  mandatory table header for mobile
 *
 * @param renderDesktopRow - optional table row renderer for desktop
 *  if not provided falls back to other renderers
 * @param laptopTableHead - optional table row renderer for laptop
 *  if not provided falls back to tablet or mobile renderers
 * @param tabletTableHead - optional table row renderer for tablet
 *  if not provided falls back to mobile table renderer
 * @param mobileTableHead - mandatory table row renderer for mobile
 *
 * @param {boolean} paginated - if true table will be paginated
 * @param {number} pageSize - optional number to set default number of rows
 *  for each page
 * @param {number} defaultPage - optional number to set default start page number
 */

export const EnhancedTable = <Row,>(props: EnhancedTableProps<Row>) => {
  const {
    data,

    desktopTableHead,
    laptopTableHead,
    tabletTableHead,
    mobileTableHead,

    renderDesktopRow,
    renderLaptopRow,
    renderTabletRow,
    renderMobileRow,

    paginated,
    pageSize,
    defaultPage,
  } = props;

  const {
    page,
    visibleRows,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
  } = usePagination<Row>(data, paginated, {
    rowsPerPage: pageSize,
    startPageNumber: defaultPage,
  });

  const tableHead = useResponsiveValue({
    mobile: mobileTableHead,
    tablet: desktopTableHead,
    laptop: laptopTableHead,
    desktop: tabletTableHead,
  });

  const rowRenderFunction = useResponsiveValue({
    mobile: renderMobileRow,
    tablet: renderTabletRow,
    laptop: renderLaptopRow,
    desktop: renderDesktopRow,
  });

  const isMobile = useIsMobile();

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

  const renderBody = () => (
    <TableBody>{visibleRows.map(rowRenderFunction)}</TableBody>
  );

  const renderFooter = () => (
    <TableFooter>
      <TableRow>
        <TableCell colSpan={isMobile ? 2 : 8} padding="none">
          <Box py={1}>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              count={data.length}
            />
          </Box>
        </TableCell>
      </TableRow>
    </TableFooter>
  );

  return (
    <TableContainer>
      <MuiTable>
        {renderHead()}
        {renderBody()}
        {paginated && renderFooter()}
      </MuiTable>
    </TableContainer>
  );
};
