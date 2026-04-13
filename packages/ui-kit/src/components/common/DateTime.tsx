import React, { useMemo } from 'react';

import { formatDateTime } from '../../utils';
import { Skeleton, Typography } from '../base';

/**
 * Props for the DateTime component.
 */
export type DateTimeProps = {
  /**
   * Unix timestamp in milliseconds.
   * If not provided, the component will display `"invalid"`.
   */
  timestamp?: number;

  /**
   * Whether the component is in loading state.
   * When `true`, a skeleton placeholder will be shown.
   */
  loading?: boolean;
};

const Loading = () => {
  return (
    <Typography variant="body1" gutterBottom>
      <Skeleton
        width={80}
        sx={{ borderRadius: (theme) => theme.spacing(0.5) }}
      />
    </Typography>
  );
};

/**
 * A component to display a formatted date and time string.
 *
 * - If `loading` is `true`, it renders a skeleton placeholder.
 * - If `timestamp` is not provided, it renders `"invalid"`.
 * - Otherwise, it formats the given timestamp into a readable date-time string
 *   using the `Intl.DateTimeFormat` API with the `en-US` locale.
 *
 * Example output: `"Aug 27 2025 01:33:12"`.
 */
export const DateTime = ({ timestamp, loading }: DateTimeProps) => {
  const parts = useMemo(() => formatDateTime(timestamp), [timestamp]);

  if (loading) return <Loading />;

  return (
    <Typography variant="body1" color="textPrimary">
      {parts}
    </Typography>
  );
};
