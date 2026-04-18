import React, { ComponentType, useState } from 'react';

import { ListSubheader, Menu, MenuItem } from '@mui/material';

import { Button, Icon, IconButton, Typography } from '@/components';
import { usePagination } from '@/components/pagination/usePagination';
import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

import './styles.scss';

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

export type PaginationOverriddenProps = OverridableType<
  PaginationBaseProp,
  PaginationOverrides,
  never
>;

export type UsePaginationItem = {
  onClick: React.ReactEventHandler;
  type:
    | 'page'
    | 'first'
    | 'last'
    | 'next'
    | 'previous'
    | 'start-ellipsis'
    | 'end-ellipsis';
  page: number | null;
  selected: boolean;
  disabled: boolean;
};

export const PaginationBase = ({
  defaultPageIndex = 0,
  defaultPageSize = 10,
  disabled,
  total = 0,
  pageIndex,
  pageSize,
  pageSizeOptions = [10, 25, 100],
  onPageIndexChange,
  onPageSizeChange,
}: PaginationOverriddenProps) => {
  const isControlled = pageIndex !== undefined;
  const isPageSizeControlled = pageSize !== undefined;

  const [internalPageIndex, setInternalPageIndex] = useState(defaultPageIndex);

  const [internalPageSize, setInternalPageSize] = useState(defaultPageSize);

  const currentPageIndex = isControlled ? pageIndex! : internalPageIndex;

  const pageSizeCurrent = isPageSizeControlled ? pageSize! : internalPageSize;

  // ---------------- Pagination core ----------------

  const setPageIndexSafe = (page: number) => {
    if (!isControlled) {
      setInternalPageIndex(page);
    }
    onPageIndexChange?.(page);
  };

  const setPageSizeSafe = (size: number) => {
    if (!isPageSizeControlled) {
      setInternalPageSize(size);
    }
    onPageSizeChange?.(size);
  };

  const pagination = usePagination({
    total,
    currentPage: currentPageIndex + 1,
    pageSize: pageSizeCurrent,
    onPageChange: (page) => setPageIndexSafe(page - 1),
    // stable: false,
  });

  // ---------------- Menu state ----------------

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (size: number) => {
    setPageSizeSafe(size);

    // reset page index when page size changes
    if (!isControlled) {
      setInternalPageIndex(0);
    }
    onPageIndexChange?.(0);

    handleMenuClose();
  };

  return (
    <div className="RosenPagination-root">
      <div className="RosenPagination-info">
        <Typography
          variant="body2"
          color="text-secondary"
          className="pagination-text"
        >
          {pagination.from} to {pagination.to} of {total}
          <span className="mobile-hide">
            {' '}
            {Number(total) <= 1 ? 'Entry' : 'Entries'}
          </span>
        </Typography>
      </div>

      {/* ---------------- Pages ---------------- */}

      <div className="RosenPagination-pages">
        <IconButton
          size="small"
          data-type="prev"
          onClick={pagination.prev}
          disabled={disabled}
        >
          <Icon name="AngleLeft" />
        </IconButton>
        {/* FULL MODE */}
        <div
          style={{ display: disabled ? 'node' : undefined }}
          className="Pages"
        >
          {pagination.pages.map((page, i) => (
            <button
              key={i}
              disabled={disabled || page === '...'}
              onClick={() => pagination.goTo(page as number)}
              data-type={page === currentPageIndex + 1 ? 'active' : 'default'}
            >
              <Typography variant="body2">{page}</Typography>
            </button>
          ))}
        </div>
        <IconButton
          size="small"
          data-type="next"
          onClick={pagination.next}
          disabled={disabled}
        >
          <Icon name="AngleRight" />
        </IconButton>
      </div>

      {/* ---------------- Page Size + Menu ---------------- */}

      <div className="RosenPagination-actions">
        <div className="RosenPagination-divider" />

        <div className="RosenPagination-actionsInner">
          <div className="RosenPagination-sizeWrapper">
            <Button
              disabled={disabled}
              size="small"
              className="RosenPagination-button"
              onClick={handleMenuOpen}
            >
              <div className="RosenPagination-size">
                <Typography
                  color="text-secondary"
                  variant="body2"
                  className="RosenPagination-sizeText"
                >
                  Items per page: {pageSizeCurrent}
                </Typography>

                <div className="RosenPagination-icon RosenPagination-icon--desktop">
                  <Icon color="text-secondary" name="CaretDown" size="24px" />
                </div>

                <div className="RosenPagination-icon RosenPagination-icon--mobile">
                  <Icon color="text-secondary" name="AlignCenter" size="24px" />
                </div>
              </div>
            </Button>

            <Menu
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{ className: 'RosenPagination-menuPaper' }}
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
    </div>
  );
};

PaginationBase.displayName = 'Pagination';

export const Pagination = Wrap(PaginationBase);

export type PaginationProps = ComponentType<typeof Pagination>;
