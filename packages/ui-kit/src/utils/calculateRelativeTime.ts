export type RelativeTimeResult = {
  prefix?: string;
  number?: string;
  unit?: string;
  suffix?: string;
  displayText?: string;
};

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
 * Calculates human-readable relative time for a given timestamp.
 *
 * @param timestamp - A `Date` or number (seconds since Unix epoch).
 *   Falsy values return an invalid result.
 *
 * @returns {@link RelativeTimeResult} with:
 *   - `prefix`: e.g., "in" for future
 *   - `number`: numeric value or "now"
 *   - `unit`: time unit (pluralized or with "ago")
 *   - `suffix`: optional, usually empty
 *   - `displayText`: set when input is invalid
 *
 * - Differences < 10s → "now"
 * - Positive → future, Negative → past
 * - Rounds values using `Math.round`
 *
 * @example
 * calculateRelativeTime(new Date(Date.now() + 60000));
 * // { prefix: "in", number: "1", unit: "minute", suffix: "", displayText: undefined }
 */
export const calculateRelativeTime = (
  timestamp?: Date | number,
): RelativeTimeResult => {
  if (!timestamp) {
    return { displayText: 'invalid' };
  }
  const now = Date.now();

  const target =
    timestamp instanceof Date ? timestamp.getTime() : timestamp * 1000;

  const diff = target - now;
  const abs = Math.abs(diff);

  /**
   * If the time difference is less than 10 seconds,
   * treat it as "now" to avoid confusing rapidly changing text like
   * "in 1 second" or "1 second ago".
   */
  if (abs < 10_000) {
    return {
      prefix: '',
      number: 'now',
      unit: '',
      suffix: '',
      displayText: undefined,
    };
  }

  const unit =
    RELATIVE_TIME_UNITS.find((u) => abs >= u.value) ??
    RELATIVE_TIME_UNITS.at(-1)!;

  const value = Math.round(abs / unit.value) || 1;
  const unitName = value > 1 ? `${unit.name}s` : unit.name;

  return diff > 0
    ? { prefix: 'in', number: String(value), unit: unitName }
    : { number: String(value), unit: `${unitName} ago` };
};
