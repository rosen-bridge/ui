import React, { FC, useEffect, useMemo, useRef, useState } from 'react';

import { InfoCircle } from '@rosen-bridge/icons';

import { useIsMobile } from '../../hooks';
import {
  Box,
  CircularProgress,
  Divider,
  IconButton,
  SvgIcon,
  Tooltip,
  Typography,
} from '../base';

interface VersionProps {
  label: string;
  value?: string;
  sub?: Array<{ label: string; value?: string }>;
}

export const Version: FC<VersionProps> = ({ label, value, sub }) => {
  const isMobile = useIsMobile();

  const $timeout = useRef<number>();

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
          <CircularProgress size={15} />
        </Box>
      ) : (
        <>
          <Tooltip
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
            <IconButton sx={{ padding: '12px' }}>
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
