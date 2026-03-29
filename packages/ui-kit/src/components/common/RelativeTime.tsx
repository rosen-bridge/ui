import { useMemo } from 'react';

import { styled } from '@mui/material';

import { Skeleton, Typography } from '@/components';
import { calculateRelativeTime } from '@/utils';

/**
 * Properties for the {@link RelativeTime} component.
 *
 * @remarks
 * Pass a timestamp as a {@link Date} or a `number` representing
 * seconds since the Unix epoch (not milliseconds).
 * The component calculates the difference with `Date.now()` and displays
 * a human-readable relative time string.
 */
export type RelativeTimeProps = {
  /**
   * The target time to compare with the current time.
   *
   * @remarks
   * If a number is passed, it is interpreted as a UNIX timestamp in **seconds**.
   * If a {@link Date} is passed, it will be automatically converted to milliseconds.
   */
  timestamp?: Date | number;
  /**
   * Optional flag to show loading state.
   * When true, the component will display 'Loading...' instead of the timestamp.
   */
  isLoading?: boolean;
};

/**
 * The styled root container for {@link RelativeTime}.
 *
 * @internal
 */
const Root = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(0.5),
}));

/**
 * Convert input timestamp to milliseconds.
 *
 * @param input - A {@link Date} object or a `number` representing seconds.
 * @returns Milliseconds since Unix epoch.
 *
 * @internal
 */
const renderTypography = (text: string) => (
  <Typography
    variant="body2"
    sx={{
      color: (theme) => theme.palette.text.primary,
      opacity: 0.6,
    }}
  >
    {text}
  </Typography>
);

/**
 * A lightweight component to display relative time based on a given timestamp.
 *
 * @example
 * ```tsx
 * <RelativeTime timestamp={new Date()} />
 * <RelativeTime timestamp={1718054902} />
 * ```
 *
 * @remarks
 * Uses {@link Intl.RelativeTimeFormat} localized to English ("en").
 * For other languages, localization support should be added.
 *
 * @param props - {@link RelativeTimeProps}
 * @returns React element showing relative time.
 */
export const RelativeTime = ({ timestamp, isLoading }: RelativeTimeProps) => {
  const { prefix, number, unit, suffix, displayText } = useMemo(
    () => calculateRelativeTime(timestamp),
    [timestamp],
  );

  if (isLoading) {
    return (
      <Root>
        <Skeleton width={80} height={27} />
      </Root>
    );
  }

  if (displayText) {
    return <Root>{renderTypography(displayText)}</Root>;
  }

  return (
    <Root>
      {prefix && renderTypography(prefix)}
      <Typography
        sx={{
          fontSize: '18px',
          color: (theme) => theme.palette.text.primary,
        }}
      >
        {number}
      </Typography>
      {unit && renderTypography(unit)}
      {suffix && renderTypography(suffix)}
    </Root>
  );
};
