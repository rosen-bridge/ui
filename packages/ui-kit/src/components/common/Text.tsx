import { HTMLAttributes } from 'react';

import { Skeleton, Typography } from '../base';
import { InjectOverrides } from './InjectOverrides';

export type TextProps = {
  loading?: boolean;
} & HTMLAttributes<HTMLSpanElement>;

/**
 * Renders text inside Typography.
 * - Shows children by default.
 * - Displays Skeleton when `loading` is true.
 */
const TextBase = ({ children, loading, ...props }: TextProps) => {
  return (
    <Typography {...props}>
      {!loading ? children : <Skeleton width="80px" variant="text" />}
    </Typography>
  );
};

export const Text = InjectOverrides(TextBase);
