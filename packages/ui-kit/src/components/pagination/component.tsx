import React, { useState } from 'react';

import { ListSubheader, Menu, MenuItem } from '@mui/material';

import { Button, Divider, Icon, IconButton, Typography } from '@/components';
import { useConfig, usePagination } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PaginationOverrides {}

export type PaginationOwnProps = {
  defaultPageIndex?: number;
  defaultPageSize?: number;
  disabled?: boolean;
  total?: number;
  pageIndex?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageIndexChange?: (index: number) => void;
  onPageSizeChange?: (size: number) => void;
};

export type PaginationBaseProp = ElementBaseProps<'div', PaginationOwnProps>;

export type PaginationProps = OverridableType<
  PaginationBaseProp,
  PaginationOverrides,
  never
>;

export const Pagination = (props: PaginationProps) => {
  const {
    defaultPageIndex = 0,
    defaultPageSize = 10,
    disabled,
    total = 0,
    pageIndex,
    pageSize,
    pageSizeOptions = [10, 25, 100],
    onPageIndexChange,
    onPageSizeChange,
    ...rest
  } = useConfig('Pagination', props);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const [internalPageIndex, setInternalPageIndex] = useState(defaultPageIndex);

  const [internalPageSize, setInternalPageSize] = useState(defaultPageSize);

  const currentPageIndex = pageIndex ?? internalPageIndex;

  const pageSizeCurrent = pageSize ?? internalPageSize;

  const handlePageChange = (page: number) => {
    if (pageIndex === undefined) {
      setInternalPageIndex(page);
    }
    onPageIndexChange?.(page);
  };

  const handlePageSize = (size: number) => {
    if (pageSize === undefined) {
      setInternalPageSize(size);
    }
    onPageSizeChange?.(size);
  };

  const pagination = usePagination({
    total,
    currentPage: currentPageIndex + 1,
    pageSize: pageSizeCurrent,
    onPageChange: (page) => handlePageChange(page - 1),
  });

  const openMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const closeMenu = () => setAnchorEl(null);

  const handleSelect = (size: number) => {
    handlePageSize(size);

    handlePageChange(0);

    closeMenu();
  };

  return (
    <div {...rest}>
      <Typography
        variant="body2"
        color="text-secondary"
        className="RosenPagination-info"
      >
        <span className="pagination-text">
          {pagination.from} to {pagination.to} of {total}{' '}
          <span className="hide">
            {' '}
            {Number(total) <= 1 ? ' Entry' : ' Entries'}
          </span>
        </span>
      </Typography>

      <div className="RosenPagination-pages">
        <IconButton
          size="small"
          data-action="prev"
          onClick={pagination.prev}
          disabled={disabled || !pagination.hasPrev}
        >
          <Icon name="AngleLeft" />
        </IconButton>
        <div
          style={{ display: disabled ? 'node' : undefined }}
          className="Pages"
        >
          {pagination.pages.map((page, i) => (
            <button
              key={i}
              disabled={disabled || page === '...'}
              onClick={() => {
                if (page !== '...') pagination.goTo(page as number);
              }}
              data-type={page !== '...' && 'page'}
              data-action={page === currentPageIndex + 1 ? 'active' : 'default'}
            >
              <Typography variant="body2">{page}</Typography>
            </button>
          ))}
        </div>
        <IconButton
          size="small"
          data-action="next"
          onClick={pagination.next}
          disabled={disabled || !pagination.hasNext}
        >
          <Icon name="AngleRight" />
        </IconButton>
      </div>

      <div className="RosenPagination-actions">
        <Divider orientation="vertical" />
        <div className="RosenPagination-actionsInner">
          <Button
            disabled={disabled}
            size="small"
            className="RosenPagination-button"
            onClick={openMenu}
          >
            <Typography color="text-secondary" variant="body2">
              Items per page: {pageSizeCurrent}
            </Typography>

            <Icon
              className="RosenPagination-icon"
              color="text-secondary"
              data-size="larg"
              name="CaretDown"
              size="24px"
            />

            <Icon
              className="RosenPagination-icon"
              color="text-secondary"
              data-size="small"
              name="AlignCenter"
              size="24px"
            />
          </Button>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={closeMenu}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{
              paper: {
                className: 'RosenPagination-menuPaper',
              },
            }}
            disablePortal
          >
            <ListSubheader className="RosenPagination-menuHeader">
              <Typography variant="body2" color="text-secondary">
                Items per page: {pageSizeCurrent}
              </Typography>
            </ListSubheader>

            {pageSizeOptions.map((option) => (
              <MenuItem
                key={option}
                selected={option === pageSizeCurrent}
                onClick={() => handleSelect(option)}
              >
                {option}
              </MenuItem>
            ))}
          </Menu>
        </div>
      </div>
    </div>
  );
};

Pagination.displayName = 'Pagination';
