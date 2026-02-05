import React from 'react';

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
  if (loading) return <Loading />;

  if (!timestamp) {
    return (
      <Typography variant="body1" color="textPrimary">
        Invalid DateTime
      </Typography>
    );
  }

  const date = new Date(timestamp);

  const parts = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
    .format(date)
    .replace(/,\s*/g, ' ');

  return (
    <Typography variant="body1" color="textPrimary">
      {parts}
    </Typography>
  );
};
