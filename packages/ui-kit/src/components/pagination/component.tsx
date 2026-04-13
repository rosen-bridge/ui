import { ComponentType, MouseEvent, useEffect, useRef, useState } from 'react';

import { Pagination as PaginationMui } from '@mui/material';

import {
  Button,
  Icon,
  ListSubheader,
  Menu,
  MenuItem,
  Typography,
} from '@/components';
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
  const isPageIndexControlled = pageIndex !== undefined;
  const isPageSizeControlled = pageSize !== undefined;

  const pageIndexCurrent = isPageIndexControlled ? pageIndex : defaultPageIndex;

  const pageSizeCurrent = isPageSizeControlled ? pageSize : defaultPageSize;

  const containerRef = useRef<HTMLDivElement>(null);
  const [responsiveSiblingCount, setResponsiveSiblingCount] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      const next = width < 864 ? 0 : 1;

      setResponsiveSiblingCount((prev) => (prev === next ? prev : next));
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const totalPages = Math.ceil(total / pageSizeCurrent);

  const from = total === 0 ? 0 : pageIndexCurrent * pageSizeCurrent + 1;
  const to = Math.min((pageIndexCurrent + 1) * pageSizeCurrent, total);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const menuOpen = !!anchorEl;

  const handleMenuOpen = (e: MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);

  const handleMenuClose = () => setAnchorEl(null);

  const handleSelect = (value: number) => {
    onPageSizeChange?.(value);
    handleMenuClose();
  };

  useEffect(() => {
    if (!isPageIndexControlled) {
      onPageIndexChange?.(defaultPageIndex);
    }
  }, [isPageIndexControlled, defaultPageIndex, onPageIndexChange]);

  useEffect(() => {
    if (!isPageSizeControlled) {
      onPageSizeChange?.(defaultPageSize);
    }
  }, [isPageSizeControlled, defaultPageSize, onPageSizeChange]);

  return (
    <div className="RosenPagination-root">
      <div className="RosenPagination-info">
        <Typography
          variant="body2"
          color="text-secondary"
          className="pagination-text"
        >
          {from} to {to} of {total}
          <span className="mobile-hide">
            {' '}
            {Number(total) <= 1 ? 'Entry' : ' Entries'}
          </span>
        </Typography>
      </div>
      <div className="RosenPagination-pages">
        <PaginationMui
          disabled={disabled}
          color="primary"
          count={totalPages}
          page={pageIndexCurrent + 1}
          onChange={(_, val) => onPageIndexChange?.(val - 1)}
          size="medium"
          siblingCount={responsiveSiblingCount}
          boundaryCount={1}
        />
      </div>

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
