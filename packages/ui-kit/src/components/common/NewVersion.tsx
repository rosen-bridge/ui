import React, { FC, useEffect, useState } from 'react';

import { styled } from '../../styling';
import { CircularProgress } from '../base';

interface VersionProps {
  label: string;
  value?: string;
  sub?: Array<{ label: string; value?: string }>;
  important?: boolean;
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
  color: '#ffffff',
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

export const NewVersion: FC<VersionProps> = ({ label, value, sub }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [versionValue, setVersionValue] = useState<string | undefined>(value);
  const [subValues, setSubValues] = useState(sub);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);

      setVersionValue((prev) => prev || '?');
      setSubValues((prev) =>
        prev?.map((item) => ({
          label: item.label,
          value: item.value || '?',
        })),
      );
    }, 15000);

    return () => clearTimeout(timer);
  }, [value, sub]);

  const isTablet = window.innerWidth <= 640;

  const formattedSub = subValues
    ?.map((item) => `${item.label} v${item.value}`)
    .join(', ');

  return (
    <Root>
      {isLoading ? (
        <CircularProgress sx={{ mt: 0.5 }} size={8} />
      ) : (
        <>
          <span>
            {label} v{versionValue}
          </span>

          {formattedSub &&
            (isTablet
              ? ` (${formattedSub})`
              : subValues?.map((item, index) => (
                  <span key={index}>
                    {item.label} v{item.value}
                  </span>
                )))}
        </>
      )}
    </Root>
  );
};
