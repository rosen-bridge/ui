import React, { FC, useEffect, useMemo, useRef, useState } from 'react';

import { useIsMobile } from '../../hooks';
import { styled } from '../../styling';
import { CircularProgress, Tooltip } from '../base';

interface VersionProps {
  label: string;
  value?: string;
  sub?: Array<{ label: string; value?: string }>;
}

const Root = styled('div', {
  name: 'RosenVersion',
  slot: 'Root',
  overridesResolver: (props, styles) => styles.root,
})(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'start',
  fontWeight: '400px',
  fontSize: '12px',
  lineHeight: '14.06px',
  color: theme.palette.text.secondary,
  [theme.breakpoints.down('tablet')]: {
    flexDirection: 'row',
    justifyContent: 'start',
    position: 'absolute',
    left: '46px',
    top: '32px',
    lineHeight: '12px',
    gap: theme.spacing(1),
  },
}));

export const Version: FC<VersionProps> = ({ label, value, sub }) => {
  const $timeout = useRef<number>();

  const isMobile = useIsMobile();

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

  const truncateString = (str: string | undefined, maxLength: number) => {
    if (str && str.length > maxLength) {
      return str?.substring(0, 5) + '...';
    }
    return str;
  };

  return (
    <Root>
      {isLoading ? (
        <CircularProgress sx={{ mt: 0.5 }} size={8} />
      ) : (
        <>
          <Tooltip
            title={
              <div>
                <span>
                  {label} v{value || '?'}
                </span>
                {isMobile && sub ? (
                  <span>
                    (
                    {sub
                      ?.map((item) => `${item.label} v${item.value || '?'}`)
                      .join(', ')}
                    )
                  </span>
                ) : (
                  <>
                    {sub?.map((item) => (
                      <span key={item.label}>
                        {item.label} v{item.value || '?'}
                      </span>
                    ))}
                  </>
                )}
              </div>
            }
          >
            <div
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'row' : 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <span>
                {label} v{value || '?'}
              </span>
              {isMobile && sub ? (
                <span>
                  (
                  {sub
                    ?.map(
                      (item) =>
                        `${item.label} v${truncateString(item.value, 7) || '?'}`,
                    )
                    .join(', ')}
                  )
                </span>
              ) : (
                <>
                  {sub?.map((item) => (
                    <span key={item.label}>
                      {item.label} v{truncateString(item.value, 7) || '?'}
                    </span>
                  ))}
                </>
              )}
            </div>
          </Tooltip>
        </>
      )}
    </Root>
  );
};
