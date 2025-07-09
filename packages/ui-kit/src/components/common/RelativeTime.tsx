import React, { useMemo } from 'react';

import { styled } from '../../styling';
import { Typography } from '../base';

/**
 * Properties for the {@link RelativeTime} component.
 *
 * @remarks
 * Pass a timestamp as a {@link Date} or a `number` (seconds since Unix epoch).
 * The component calculates the difference with `Date.now()` and displays it in a human-readable relative format.
 */
export type RelativeTimeProps = {
  /**
   * The target time to compare with the current time.
   *
   * @remarks
   * If a number is passed, it is interpreted as a UNIX timestamp in **seconds**.
   * If a {@link Date} is passed, it will be converted automatically.
   */
  timestamp: Date | number;
};

/**
 * Configuration for each time unit used by {@link RelativeTime}.
 *
 * @internal
 */
export type UnitConfig = {
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
  return input * 1000; // Assumes seconds, convert to ms
};

/**
 * Splits a formatted relative time string into prefix/core/suffix.
 *
 * @param formatted - String from {@link Intl.RelativeTimeFormat}.
 * @returns An object containing parts.
 *
 * @internal
 */
function splitRelativeTime(formatted: string) {
  let prefix = '';
  let core = formatted;
  let suffix = '';

  if (formatted.startsWith('in ')) {
    prefix = 'in';
    core = formatted.slice(3);
  } else if (formatted.endsWith(' ago')) {
    suffix = 'ago';
    core = formatted.slice(0, -4);
  }

  return { prefix, core, suffix };
}

/**
 * Helper to render consistent typography.
 *
 * @param text - Text content.
 * @returns {@link Typography} component.
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
 * Uses {@link Intl.RelativeTimeFormat} for accurate localization (hardcoded to `"en"`).
 *
 * @param props - {@link RelativeTimeProps}
 * @returns React element with relative time.
 */
export const RelativeTime = ({ timestamp }: RelativeTimeProps) => {
  const { prefix, number, unit, suffix } = useMemo(() => {
    const now = Date.now();
    const target = getTimeValue(timestamp);
    const diff = target - now;
    const abs = Math.abs(diff);

    if (abs < 10 * 1000) {
      return { prefix: '', number: 'now', unit: '', suffix: '' };
    }

    const unitObj =
      RELATIVE_TIME_UNITS.find((u) => abs >= u.value) ??
      RELATIVE_TIME_UNITS.at(-1)!;
    const value = Math.round(abs / unitObj.value) || 1;
    const signedValue = diff > 0 ? value : -value;

    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'always' });
    const formatted = rtf.format(signedValue, unitObj.name);

    const { prefix, core, suffix } = splitRelativeTime(formatted);
    const [number, unit] = core.split(' ');

    return { prefix, number, unit, suffix };
  }, [timestamp]);

  if (number === 'now') {
    return renderTypography('now');
  }

  return (
    <Root>
      {prefix && renderTypography(prefix)}
      <Typography
        sx={{ fontSize: '18px', color: (theme) => theme.palette.text.primary }}
      >
        {number}
      </Typography>
      {renderTypography(unit)}
      {suffix && renderTypography(suffix)}
    </Root>
  );
};
