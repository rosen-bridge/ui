import React, { FC, useEffect, useRef, useState } from 'react';

import { Pagination } from '@mui/material';
import { CaretDown, AlignCenter } from '@rosen-bridge/icons';

import {
  Box,
  Typography,
  MenuItem,
  IconButton,
  Menu,
  SvgIcon,
  Divider,
} from '../base';

interface PaginationBarProps {
  page: number;
  total: number;
  pageSize: number;
  pageSizeOptions: number[];
  onPageChange: (newPage: number) => void;
  onSizeChange: (newRows: number) => void;
}

export const NewPagination: FC<PaginationBarProps> = ({
  page,
  total,
  pageSize,
  pageSizeOptions,
  onPageChange,
  onSizeChange,
}) => {
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

  const totalPages = Math.ceil(total / pageSize);
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (value: number) => {
    onSizeChange(value);
    handleMenuClose();
  };

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
          color="primary"
          count={totalPages}
          page={page}
          onChange={(_, val) => onPageChange(val)}
          size="small"
          siblingCount={responsiveSiblingCount}
          boundaryCount={1}
          sx={(theme) => ({
            '& .MuiPagination-ul': {
              display: 'flex',
              flexDirection: 'row',
              gap: theme.spacing(2),
            },
            '& .MuiPaginationItem-root': {
              fontSize: 14,
            },
            '@container (max-width: 644px)': {
              '& li:not(:first-child):not(:last-child)': {
                display: 'none',
              },
              '& .MuiPagination-ul': {
                justifyContent: 'space-between',
              },
            },
          })}
        />
      </Box>

      <Box
        sx={(theme) => ({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: theme.spacing(1),
        })}
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

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-evenly',
          }}
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
            Items per page {pageSize}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              onClick={handleMenuOpen}
              size="small"
              sx={{ padding: 1 }}
            >
              <SvgIcon
                sx={{
                  'width': 24,
                  'display': 'none',
                  '@container (min-width: 865px)': {
                    display: 'inline',
                  },
                }}
              >
                <CaretDown />
              </SvgIcon>
              <SvgIcon
                sx={{
                  'width': 24,
                  'display': 'inline',
                  '@container (min-width: 865px)': {
                    display: 'none',
                  },
                }}
              >
                <AlignCenter />
              </SvgIcon>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{ sx: { width: 204 } }}
              disablePortal
            >
              <MenuItem
                sx={{
                  'display': 'none',
                  '@container (max-width: 864px)': {
                    display: 'block',
                  },
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Items per page {pageSize}
                </Typography>
              </MenuItem>

              {pageSizeOptions.map((option) => (
                <MenuItem
                  key={option}
                  selected={option === pageSize}
                  onClick={() => handleSelect(option)}
                >
                  {option}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
