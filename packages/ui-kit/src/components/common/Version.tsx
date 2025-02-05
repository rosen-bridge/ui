import React, { FC, useEffect, useMemo, useRef, useState } from 'react';

import { InfoCircle } from '@rosen-bridge/icons';

import { styled } from '../../styling';
import { Box, CircularProgress, Divider, IconButton, Tooltip } from '../base';

interface VersionProps {
  label: string;
  value?: string;
  sub?: Array<{ label: string; value?: string }>;
}

const TooltipContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  background: theme.palette.background.default,
  color: 'black',
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
                <span>Versions</span>
                <Divider variant="middle" />
                <span>
                  {label} v{value || '?'}
                </span>
                {sub?.map((item) => (
                  <span key={item.label}>
                    {item.label} v{item.value || '?'}
                  </span>
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
