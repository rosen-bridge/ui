import { ComponentProps, useMemo } from 'react';

import { Typography, TypographyOverriddenProps } from '@/components';
import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';
import { formatDuration } from '@/utils';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DurationOverrides {}

export type DurationOwnProps = {
  /**
   * Text shown when `value` is `undefined` and `fallBack` is provided.
   */
  fallback?: string;
  /**
   * If true, shows a loading skeleton instead of the duration.
   */
  loading?: boolean;

  slots?: {
    fallback?: TypographyOverriddenProps;
    value?: TypographyOverriddenProps;
    unit?: TypographyOverriddenProps;
  };

  /** Duration in milliseconds; negative, NaN, or non-finite values are errors */
  value?: number;
};

export type DurationBaseProps = ElementBaseProps<'div', DurationOwnProps>;

export type DurationOverriddenProps = OverridableType<
  DurationBaseProps,
  DurationOverrides,
  never
>;

/**
 * A component for displaying duration values in a human-readable format.
 * It handles loading, invalid values, and fallback states automatically.
 */
export const DurationBase = ({
  fallback,
  loading,
  slots,
  value,
  ...rest
}: DurationOverriddenProps) => {
  const { parts, error } = useMemo(() => formatDuration(value), [value]);

  const ready =
    !error && !loading && !(fallback && value === undefined) && parts;

  return (
    <div {...rest}>
      {!ready && (
        <Typography component="div" loading={loading} {...slots?.fallback}>
          {fallback || 'Invalid'}
        </Typography>
      )}
      {ready &&
        parts.map((part) => (
          <div className="RosenDuration-part" key={part.value + part.unit}>
            <Typography component="div" {...slots?.value}>
              {part.value}
            </Typography>
            <Typography
              color="text-disabled"
              component="div"
              variant="caption"
              {...slots?.unit}
            >
              {part.unit}
              {part.value > 1 ? 's' : ''}
            </Typography>
          </div>
        ))}
    </div>
  );
};

DurationBase.displayName = 'Duration';

export const Duration = Wrap(DurationBase);

export type DurationProps = ComponentProps<typeof Duration>;
