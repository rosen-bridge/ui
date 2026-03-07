export type DurationPart = { value: number; unit: string };

const UNITS = [
  { label: 'year', ms: 1000 * 60 * 60 * 24 * 365 },
  { label: 'month', ms: 1000 * 60 * 60 * 24 * 30 },
  { label: 'week', ms: 1000 * 60 * 60 * 24 * 7 },
  { label: 'day', ms: 1000 * 60 * 60 * 24 },
  { label: 'hour', ms: 1000 * 60 * 60 },
  { label: 'minute', ms: 1000 * 60 },
  { label: 'second', ms: 1000 },
] as const;

/**
 * Converts a duration in milliseconds into up to two human-readable time units.
 *
 * @param value - Duration in milliseconds.
 *
 * @returns An object containing:
 * - `parts`: An array of up to two `{ value, unit }` entries representing the largest time units,
 *   or `undefined` if no valid parts could be produced.
 * - `error`: A boolean indicating whether the input is invalid.
 *
 * ### Input Handling Rules
 * - `NaN`, `Infinity`, `-Infinity`, or negative values → `error: true`
 * - Values between `0` and `< 1ms` (that produce no parts) → `error: true`
 * - `undefined` → `error: false`, `parts: undefined` (fallback may be shown by the caller)
 * - `0` → `error: false`, `parts: [{ value: 0, unit: "second" }]`
 * - Positive values producing valid parts → `error: false`
 */
export const formatDuration = (
  value?: number,
): { parts?: DurationPart[]; error: boolean } => {
  if (value === undefined) return { parts: undefined, error: false };

  if (Number.isNaN(value) || !Number.isFinite(value) || value < 0) {
    return { parts: undefined, error: true };
  }

  let remaining = value === 0 ? 0 : value;
  const parts: DurationPart[] = [];

  for (const unit of UNITS) {
    const v = Math.floor(remaining / unit.ms);
    if (v > 0 || (unit.label === 'second' && value === 0)) {
      parts.push({ value: v, unit: unit.label });
      remaining -= v * unit.ms;
    }
    if (parts.length === 2) break;
  }

  return {
    parts: parts.length ? parts : undefined,
    error: !parts.length && value !== 0,
  };
};
