import { useMemo } from 'react';

import { Typography, TypographyProps } from '@/components';
import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';
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
    fallback?: TypographyProps;
    value?: TypographyProps;
    unit?: TypographyProps;
  };

  /** Duration in milliseconds; negative, NaN, or non-finite values are errors */
  value?: number;
};

export type DurationBaseProps = ElementBaseProps<'div', DurationOwnProps>;

export type DurationProps = OverridableType<
  DurationBaseProps,
  DurationOverrides,
  never
>;

/**
 * A component for displaying duration values in a human-readable format.
 * It handles loading, invalid values, and fallback states automatically.
 */
export const Duration = (props: DurationProps) => {
  const { fallback, loading, slots, value, ...rest } = useConfig(
    'Duration',
    props,
  );

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

Duration.displayName = 'Duration';
