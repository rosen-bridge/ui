import React, { FC, useMemo, useState } from 'react';

import { useIsMobile } from '../../hooks';
import { styled } from '../../styling';
import { CircularProgress } from '../base';

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
  color: theme.palette.secondary.light,
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
  const [isLoading, setIsLoading] = useState(true);

  const isMobile = useIsMobile();

  const { versionValue, subValues, formattedSub } = useMemo(() => {
    const versionValue = value || '?';
    const subValues = sub?.map((item) => ({
      label: item.label,
      value: item.value || '?',
    }));
    const formattedSub = subValues
      ?.map((item) => `${item.label} v${item.value}`)
      .join(', ');

    if (isLoading) {
      setTimeout(() => setIsLoading(false), 15000);
    }

    return { versionValue, subValues, formattedSub };
  }, [value, sub, isLoading]);

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
            (isMobile ? (
              <span> ({formattedSub}) </span>
            ) : (
              subValues?.map((item, index) => (
                <span key={index}>
                  {item.label} v{item.value}
                </span>
              ))
            ))}
        </>
      )}
    </Root>
  );
};
