import { useMemo } from 'react';

import { Typography } from '@/components';
import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';
import { formatDateTime } from '@/utils';

export interface DateTimeOverrides {}

export type DateTimeOwnProps = {
  /**
   * Whether the component is in loading state.
   * When `true`, a skeleton placeholder will be shown.
   */
  loading?: boolean;

  /**
   * Unix timestamp in milliseconds.
   * If not provided, the component will display `"invalid"`.
   */
  timestamp?: number;
};

export type DateTimeBaseProps = ElementBaseProps<'div', DateTimeOwnProps>;

export type DateTimeProps = OverridableType<
  DateTimeBaseProps,
  DateTimeOverrides,
  never
>;

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
export const DateTime = (props: DateTimeProps) => {
  const { color, loading, timestamp, ...rest } = useConfig('DateTime', props);

  void color;

  const parts = useMemo(() => formatDateTime(timestamp), [timestamp]);

  return (
    <Typography
      color="text-primary"
      gutterBottom={loading}
      loading={loading}
      variant="body1"
      {...rest}
    >
      {parts}
    </Typography>
  );
};

DateTime.displayName = 'DateTime';
