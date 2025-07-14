import React, { useMemo } from 'react';

import { styled } from '../../styling';
import { Typography } from '../base';

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
  timestamp: Date | number;
};
/**
 * Configuration for each time unit used by {@link RelativeTime}.
 *
 * @internal
 */
type UnitConfig = {
  /**
   * Unit name, valid for {@link Intl.RelativeTimeFormat}.
   */
  name: Intl.RelativeTimeFormatUnit;

  /**
   * Unit duration in milliseconds.
   */
  value: number;
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
 * Ordered time units for relative calculation.
 *
 * @internal
 */
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
 * Convert input to milliseconds.
 *
 * @param input - {@link Date} or `number` (interpreted as seconds).
 * @returns Milliseconds since epoch.
 *
 * @internal
 */
const getTimeValue = (input: Date | number): number => {
  if (input instanceof Date) {
    return input.getTime();
  }
  return input * 1000;
};

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
export const RelativeTime = ({ timestamp }: RelativeTimeProps) => {
  const { prefix, number, unit, suffix } = useMemo(() => {
    const now = Date.now();
    const target = getTimeValue(timestamp);
    const diff = target - now;
    const abs = Math.abs(diff);

    /**
     * If the time difference is less than 10 seconds,
     * treat it as "now" to avoid confusing rapidly changing text like
     * "in 1 second" or "1 second ago".
     */
    if (abs < 10 * 1000) {
      return { prefix: '', number: 'now', unit: '', suffix: '' };
    }

    const unitObj =
      RELATIVE_TIME_UNITS.find((u) => abs >= u.value) ??
      RELATIVE_TIME_UNITS.at(-1)!;
    const value = Math.round(abs / unitObj.value) || 1;

    if (diff > 0) {
      return {
        prefix: 'in',
        number: value.toString(),
        unit: unitObj.name,
        suffix: '',
      };
    } else {
      return {
        prefix: '',
        number: value.toString(),
        unit: unitObj.name + ' ago',
        suffix: '',
      };
    }
  }, [timestamp]);

  return (
    <Root>
      {!unit && number === 'now' ? (
        renderTypography('now')
      ) : (
        <>
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
        </>
      )}
    </Root>
  );
};
