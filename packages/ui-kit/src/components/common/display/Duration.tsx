import { ComponentProps, forwardRef, HTMLAttributes, useMemo } from 'react';

import { Skeleton, Typography } from '@mui/material';
import { ExclamationTriangle } from '@rosen-bridge/icons';

import { InjectOverrides } from '../InjectOverrides';
import { Stack } from '../Stack';
import { SvgIcon } from '../SvgIcon';

export type DurationBaseProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Text shown when `value` is `undefined` and `fallBack` is provided.
   */
  fallBack?: string;
  /**
   * If true, shows a loading skeleton instead of the duration.
   */
  loading?: boolean;

  /** Duration in milliseconds; negative, NaN, or non-finite values are errors */
  value?: number;
};

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
 * A component for displaying duration values in a human-readable format.
 * It handles loading, invalid values, and fallback states automatically.
 */
const DurationBase = forwardRef<HTMLDivElement, DurationBaseProps>(
  (props, ref) => {
    const { fallBack, loading, value } = props;

    /**
     * value === NaN => error
     * value === Infinity or -Infinity => error
     * value < 0 => error
     * positive number producing no parts (<1ms) => error
     * value === undefined => not error (fallback may show)
     * value === 0 => not error (0 seconds)
     * positive number with parts => not error
     */
    const { parts, error } = useMemo(() => {
      if (value === undefined) return { parts: undefined, error: false };

      if (Number.isNaN(value) || !Number.isFinite(value) || value < 0) {
        return { parts: undefined, error: true };
      }

      let remaining = value === 0 ? 0 : value;
      const parts: Array<{ value: number; unit: string }> = [];

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
    }, [value]);

    return (
      <Stack direction="row" spacing={1} ref={ref} {...props}>
        {loading ? (
          <Skeleton width={80} variant="text" />
        ) : error ? (
          <SvgIcon size="small">
            <ExclamationTriangle />
          </SvgIcon>
        ) : value === undefined && fallBack ? (
          <Typography variant="body1">{fallBack}</Typography>
        ) : (
          parts?.map((p, index) => (
            <Stack key={index} direction="row" align="baseline" spacing={0.5}>
              <Typography variant="body1">{p.value}</Typography>
              <Typography
                fontSize="12px"
                sx={{ opacity: 0.7 }}
                color="text.primary"
              >
                {p.unit}
                {p.value > 1 ? 's' : ''}
              </Typography>
            </Stack>
          ))
        )}
      </Stack>
    );
  },
);

DurationBase.displayName = 'Duration';

export const Duration = InjectOverrides(DurationBase);

export type DurationProps = ComponentProps<typeof Duration>;
