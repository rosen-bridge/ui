import { MouseEvent, useEffect, useRef, useState } from 'react';

import { Pagination } from '@mui/material';
import { CaretDown, AlignCenter } from '@rosen-bridge/icons';

import {
  Box,
  Typography,
  MenuItem,
  Menu,
  SvgIconMui,
  Divider,
  Stack,
  Button,
  ListSubheader,
} from '../base';

export interface NewPaginationProps {
  defaultPageIndex?: number;
  defaultPageSize?: number;
  disabled?: boolean;
  total?: number;
  pageIndex?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageIndexChange?: (index: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export const NewPagination = ({
  defaultPageIndex = 0,
  defaultPageSize = 10,
  disabled,
  total = 0,
  pageIndex,
  pageSize,
  pageSizeOptions = [10, 25, 100],
  onPageIndexChange,
  onPageSizeChange,
}: NewPaginationProps) => {
  const pageIndexCurrent = pageIndex ?? defaultPageIndex;
  const pageSizeCurrent = pageSize ?? defaultPageSize;

  const containerRef = useRef<HTMLDivElement>(null);
  const [responsiveSiblingCount, setResponsiveSiblingCount] = useState(1);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      setResponsiveSiblingCount(width < 864 ? 0 : 1);
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const totalPages = Math.ceil(total / pageSizeCurrent);
  const from = pageIndexCurrent * pageSizeCurrent + 1;
  const to = Math.min((pageIndexCurrent + 1) * pageSizeCurrent, total);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (value: number) => {
    onPageSizeChange?.(value);
    handleMenuClose();
  };

  useEffect(() => {
    if (typeof defaultPageIndex != 'number') return;
    if (typeof pageIndex == 'number') return;
    onPageIndexChange?.(defaultPageIndex);
  }, [defaultPageIndex, pageIndex, onPageIndexChange]);

  useEffect(() => {
    if (typeof defaultPageSize != 'number') return;
    if (typeof pageSize == 'number') return;
    onPageSizeChange?.(defaultPageSize);
  }, [defaultPageSize, pageSize, onPageSizeChange]);

  return (
    <Box
      ref={containerRef}
      sx={(theme) => ({
        backgroundColor: theme.palette.background.paper,
        containerType: 'inline-size',
        height: 56,
        width: '100%',
        padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
        borderRadius: theme.spacing(2),
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
        justifyContent: 'space-between',
      })}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            '&::before': { content: '"Showing "' },
            '& span.mobile-hide': { display: 'inline' },
            '@container (max-width: 420px)': {
              '&::before': { content: '""' },
              '& span.mobile-hide': { display: 'none' },
            },
          }}
        >
          {from} to {to} of {total}
          <Box component="span" className="mobile-hide">
            {' '}
            Entries
          </Box>
        </Typography>
      </Box>

      <Box
        sx={{
          'display': 'flex',
          'flex': 1,
          'justifyContent': 'center',
          '@container (max-width: 863px)': {
            justifyContent: 'flex-end',
          },
        }}
      >
        <Pagination
          disabled={disabled}
          color="primary"
          count={totalPages}
          page={pageIndexCurrent + 1}
          onChange={(_, val) => onPageIndexChange?.(val - 1)}
          size="medium"
          siblingCount={responsiveSiblingCount}
          boundaryCount={1}
          sx={{
            '& .MuiPagination-ul': {
              display: 'flex',
              flexDirection: 'row',
            },
            '& .MuiPaginationItem-root': {
              fontSize: 14,
            },
            '@container (max-width: 644px)': {
              '& li:not(:first-of-type):not(:last-child)': {
                display: 'none',
              },
              '& .MuiPagination-ul': {
                justifyContent: 'space-between',
              },
            },
          }}
        />
      </Box>

      <Stack
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        gap={1}
      >
        <Divider
          orientation="vertical"
          variant="middle"
          flexItem
          sx={{
            'display': 'none',
            '@container (max-width: 864px)': {
              display: 'block',
            },
          }}
        />
        <Stack
          flexDirection="row"
          alignItems="center"
          justifyContent="space-evenly"
        >
          <Stack alignItems="center">
            <Button
              disabled={disabled}
              size="small"
              sx={{ padding: 1, textTransform: 'none' }}
              onClick={handleMenuOpen}
            >
              <Stack
                flexDirection="row"
                justifyContent="center"
                alignItems="center"
                gap={1}
              >
                <Typography
                  color="text.secondary"
                  variant="body2"
                  sx={{
                    '@container (max-width: 864px)': {
                      display: 'none',
                    },
                  }}
                >
                  Items per page {pageSizeCurrent}
                </Typography>

                <SvgIconMui
                  sx={{
                    'color': (theme) => theme.palette.text.secondary,
                    'width': 24,
                    'height': 24,
                    'display': 'none',
                    '@container (min-width: 865px)': {
                      display: 'inline',
                    },
                  }}
                >
                  <CaretDown />
                </SvgIconMui>

                <SvgIconMui
                  sx={{
                    'color': (theme) => theme.palette.text.secondary,
                    'width': 24,
                    'height': 24,
                    'display': 'initial',

                    '@container (min-width: 865px)': {
                      display: 'none',
                    },
                  }}
                >
                  <AlignCenter />
                </SvgIconMui>
              </Stack>
            </Button>

            <Menu
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{ sx: { width: 204 } }}
              disablePortal
            >
              <ListSubheader
                sx={{
                  'display': 'none',
                  'backgroundColor': 'transparent',
                  '@container (max-width: 864px)': {
                    display: 'block',
                  },
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Items per page {pageSizeCurrent}
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
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};
