import React, { FC, useEffect, useMemo, useRef, useState } from 'react';

import { SvgIcon, Divider } from '@mui/material';
import { InfoCircle } from '@rosen-bridge/icons';

import { useIsMobile } from '../../hooks';
import {
  Box,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from '../base';

interface VersionProps {
  label: string;
  value?: string;
  sub?: Array<{ label: string; value?: string }>;
}

export const Version: FC<VersionProps> = ({ label, value, sub }) => {
  const $timeout = useRef<number>();

  const isMobile = useIsMobile();

  const [tooltipOpen, setTooltipOpen] = useState(false);

  const [timeout, setTimeout] = useState(false);

  const loaded = useMemo(() => {
    if (sub) {
      return !!value && !!sub.every((item) => !!item.value);
    } else {
      return !!value;
    }
  }, [value, sub]);

  const isLoading = !(loaded || timeout);

  useEffect(() => {
    clearTimeout($timeout.current);
    $timeout.current = window.setTimeout(() => {
      setTimeout(true);
    }, 15000);
    return () => {
      clearTimeout($timeout.current);
    };
  }, [value, sub]);

  return (
    <>
      {isLoading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '12px',
          }}
        >
          <CircularProgress size={15} color="inherit" />
        </Box>
      ) : (
        <>
          <Tooltip
            onClose={() => setTooltipOpen(false)}
            open={tooltipOpen}
            placement={isMobile ? 'left-start' : 'right-start'}
            arrow
            componentsProps={{
              tooltip: {
                sx: {
                  backgroundColor: (theme) => theme.palette.background.paper,
                  color: (theme) => theme.palette.text.primary,
                  boxShadow: (theme) =>
                    `0px 4px 12px ${theme.palette.background.shadow}`,
                },
              },
              arrow: {
                sx: {
                  color: (theme) => theme.palette.background.paper,
                },
              },
            }}
            title={
              <Box
                sx={(theme) => ({
                  background: theme.palette.background.paper,
                  padding: '4px',
                })}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  VERSIONS
                </Typography>
                <Divider sx={{ marginBottom: '4px' }} />
                <div>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    component="span"
                  >
                    {label}
                  </Typography>
                  <span> v{value || '?'}</span>
                </div>
                {sub?.map((item) => (
                  <div key={item.label}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      component="span"
                    >
                      {item.label}
                    </Typography>
                    <span> v{item.value || '?'}</span>
                  </div>
                ))}
              </Box>
            }
          >
            <IconButton
              sx={{ padding: '12px', color: 'inherit' }}
              onClick={() => setTooltipOpen(!tooltipOpen)}
              onMouseEnter={() => !isMobile && setTooltipOpen(true)}
              onMouseLeave={() => !isMobile && setTooltipOpen(false)}
            >
              <SvgIcon sx={{ width: 24 }}>
                <InfoCircle fill="currentColor" />
              </SvgIcon>
            </IconButton>
          </Tooltip>
        </>
      )}
    </>
  );
};
