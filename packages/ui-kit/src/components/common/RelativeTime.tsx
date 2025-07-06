import React, { useMemo } from 'react';

import { styled } from '../../styling';
import { Typography } from '../base';

/**
 * Props for the <RelativeTime /> component.
 */
export type RelativeTimeProps = {
  /**
   * The timestamp to compare to `Date.now()`.
   * Can be a Date instance, ISO string, or a number (milliseconds or seconds).
   */
  timestamp: Date | string | number;
};

/**
 * Configuration for each time unit used to calculate relative time.
 */
export type UnitConfig = {
  /**
   * The name of the time unit, compatible with Intl.RelativeTimeFormatUnit.
   * E.g. "year", "month", "week", etc.
   */
  name: Intl.RelativeTimeFormatUnit;

  /**
   * The unit value in milliseconds.
   */
  value: number;
};

const Root = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(0.5),
}));

const RELATIVE_TIME_UNITS: UnitConfig[] = [
  { name: 'year', value: 365 * 24 * 60 * 60 * 1000 },
  { name: 'month', value: 30 * 24 * 60 * 60 * 1000 },
  { name: 'week', value: 7 * 24 * 60 * 60 * 1000 },
  { name: 'day', value: 24 * 60 * 60 * 1000 },
  { name: 'hour', value: 60 * 60 * 1000 },
  { name: 'minute', value: 60 * 1000 },
  { name: 'second', value: 1000 },
];

/**
 * Converts a given input into a valid timestamp in milliseconds.
 *
 * Supports:
 * - Date instance: returns `Date.getTime()`
 * - String: parses ISO date strings, returns 0 if invalid
 * - Number: assumes seconds if less than 1e12, otherwise milliseconds
 *
 * @param input - A Date, string, or numeric timestamp
 * @returns A timestamp in milliseconds
 */
const getTimeValue = (input: Date | string | number): number => {
  if (input instanceof Date) {
    return input.getTime();
  }

  if (typeof input === 'string') {
    const parsed = Date.parse(input);
    return isNaN(parsed) ? 0 : parsed;
  }

  if (input < 1e12) {
    return input * 1000;
  }
  return input;
};

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
 * RelativeTime component
 *
 * Displays how much time is left until a given timestamp or how much time has passed.
 * Example outputs: "in 2 days", "3 hours ago", or "now".
 *
 * Useful for showing relative dates like "updated 5 minutes ago".
 */
export const RelativeTime = React.memo(({ timestamp }: RelativeTimeProps) => {
  const { value, unit, isFuture, isNow } = useMemo(() => {
    const now = Date.now();
    const targetMs = getTimeValue(timestamp);
    const diff = targetMs - now;

    const absDiff = Math.abs(diff);
    const isNow = absDiff < 10 * 1000;

    const unit =
      RELATIVE_TIME_UNITS.find((unit) => absDiff >= unit.value) ??
      RELATIVE_TIME_UNITS[RELATIVE_TIME_UNITS.length - 1];
    const value = Math.floor(absDiff / unit.value) || 1;
    const isFuture = diff > 0;

    return { value, unit: unit.name, isFuture, isNow };
  }, [timestamp]);

  if (isNow) {
    return renderTypography('now');
  }

  return (
    <Root>
      {isFuture && renderTypography('in')}
      <Typography
        sx={{
          fontSize: '18px',
          color: (theme) => theme.palette.text.primary,
        }}
      >
        {value}
      </Typography>
      {renderTypography(unit + (value !== 1 ? 's' : ''))}
      {!isFuture && renderTypography('ago')}
    </Root>
  );
});
