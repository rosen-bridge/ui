import React, { FC, useEffect, useMemo, useRef, useState } from 'react';

import { InfoCircle } from '@rosen-bridge/icons';

import { styled } from '../../styling';
import {
  Box,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
  Typography,
} from '../base';

interface VersionProps {
  label: string;
  value?: string;
  sub?: Array<{ label: string; value?: string }>;
}

const TooltipContent = styled(Box)(({ theme }) => ({
  display: 'block',
  background: theme.palette.background.default,
  padding: '4px',
  gap: '4px',
}));

export const Version: FC<VersionProps> = ({ label, value, sub }) => {
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
        <CircularProgress sx={{ mt: 0.5 }} size={15} />
      ) : (
        <>
          <Tooltip
            placement="right-start"
            arrow
            componentsProps={{
              tooltip: {
                sx: {
                  backgroundColor: (theme) => theme.palette.background.paper,
                  color: 'black',
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.25)',
                },
              },
              arrow: {
                sx: {
                  color: (theme) => theme.palette.background.paper,
                },
              },
            }}
            title={
              <TooltipContent>
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
              </TooltipContent>
            }
          >
            <IconButton>
              <InfoCircle fill="currentColor" />
            </IconButton>
          </Tooltip>
        </>
      )}
    </>
  );
};
