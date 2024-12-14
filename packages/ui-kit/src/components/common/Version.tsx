import React, { FC, useEffect, useMemo, useState } from 'react';

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
  const [versionValue, setVersionValue] = useState<string | undefined>(value);
  const [subValues, setSubValues] = useState<
    { label: string; value?: string }[]
  >(sub ? sub : []);

  const isMobile = useIsMobile();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);

      setVersionValue((prev) => prev || '?');
      setSubValues((prev) =>
        prev?.map((item) =>
          item
            ? {
                label: item.label,
                value: item.value,
              }
            : {
                label: '?',
                value: '?',
              },
        ),
      );
    }, 15000);

    return () => clearTimeout(timer);
  }, [value, sub]);

  const formattedSub = useMemo(() => {
    return subValues?.map((item) => `${item.label} v${item.value}`).join(', ');
  }, [subValues]);

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
