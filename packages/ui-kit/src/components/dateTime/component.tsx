import { ComponentProps, useMemo } from 'react';

import { Typography } from '@/components';
import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';
import { formatDateTime } from '@/utils';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
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

export type DateTimeOverriddenProps = OverridableType<
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
export const DateTimeBase = ({
  loading,
  timestamp,
  ...rest
}: DateTimeOverriddenProps) => {
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

DateTimeBase.displayName = 'DateTime';

export const DateTime = Wrap(DateTimeBase);

export type DateTimeProps = ComponentProps<typeof DateTime>;
