import React, { HTMLAttributes } from 'react';

import { InjectOverrides, Skeleton, Typography } from '@rosen-bridge/ui-kit';

export type TextProps = HTMLAttributes<HTMLSpanElement> & {
  loading?: boolean;
  value?: string | number;
};

const TextBase = ({ value, loading, ...props }: TextProps) => {
  return (
    <Typography {...props}>
      {!loading ? value : <Skeleton width="80px" variant="text" />}
    </Typography>
  );
};

export const Text = InjectOverrides(TextBase);
