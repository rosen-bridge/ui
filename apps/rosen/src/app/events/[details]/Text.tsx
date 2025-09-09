import React, { HTMLAttributes } from 'react';

import { InjectOverrides, Skeleton, Typography } from '@rosen-bridge/ui-kit';

export type TextProps = HTMLAttributes<HTMLSpanElement> & {
  loading?: boolean;
  value?: string | number;
};

const Loading = () => {
  return <Skeleton width="80px" variant="text" />;
};

const TextBase = ({ value, loading, ...props }: TextProps) => {
  if (loading) return <Loading />;
  return <Typography {...props}>{!loading ? value : <Loading />}</Typography>;
};

export const Text = InjectOverrides(TextBase);
