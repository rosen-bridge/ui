import { useEffect, useRef, useState } from 'react';

import {
  Button,
  Divider,
  Icon,
  IconButton,
  Menu,
  MenuBody,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuTrigger,
  Typography,
} from '@/components';
import { useConfig, useMenu, usePagination } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

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

export type PaginationProps = OverridableType<PaginationBaseProp, PaginationOverrides, never>;

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

  const handleMenu = useMenu();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isContainerSmall, setIsContainerSmall] = useState(false);
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

  const handleSelect = (size: number) => {
    handlePageSize(size);
    handlePageChange(0);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setIsContainerSmall(entry.contentRect.width <= 864);
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} {...rest}>
      <Typography variant="body2" color="text-secondary" className="RosenPagination-info">
        <span className="pagination-text">
          {pagination.from} to {pagination.to} of {total}{' '}
          <span className="hide"> {Number(total) <= 1 ? ' Entry' : ' Entries'}</span>
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

        <div className="Pages">
          {pagination.pages.map((item) => (
            <IconButton
              size="small"
              style={{ width: '34px' }}
              key={item.id}
              disabled={disabled || item.value === '...'}
              onClick={() => pagination.setPage(item.value)}
              data-type={item.value !== '...' ? 'page' : undefined}
              data-action={item.value === currentPageIndex + 1 ? 'active' : 'default'}
            >
              <Typography variant="body2">{item.value}</Typography>
            </IconButton>
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
          <MenuTrigger
            handle={handleMenu}
            as={Button}
            disabled={disabled}
            size="small"
            className="RosenPagination-button"
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
          </MenuTrigger>

          <Menu handle={handleMenu}>
            <MenuBody className="RosenPagination-menuBody">
              <MenuGroup>
                {isContainerSmall && (
                  <MenuGroupLabel>
                    <Typography variant="body2" color="text-secondary">
                      Items per page: {pageSizeCurrent}
                    </Typography>
                  </MenuGroupLabel>
                )}
                {pageSizeOptions.map((option) => (
                  <MenuItem
                    style={{ width: '204px' }}
                    key={option}
                    selected={option === pageSizeCurrent}
                    onClick={() => handleSelect(option)}
                  >
                    {option}
                  </MenuItem>
                ))}
              </MenuGroup>
            </MenuBody>
          </Menu>
        </div>
      </div>
    </div>
  );
};

Pagination.displayName = 'Pagination';
