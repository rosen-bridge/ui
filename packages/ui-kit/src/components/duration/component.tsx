import { ComponentProps, useMemo } from 'react';

import { OverridableType } from '@/@types';
import { ElementBaseProps, Root, Wrap } from '@/core';

import './styles.scss';
import { formatDuration } from '@/utils';
import { Typography } from '@/components';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DurationOverrides { }

export type DurationOwnProps = {
  /**
   * Text shown when `value` is `undefined` and `fallBack` is provided.
   */
  fallback?: string;
  /**
   * If true, shows a loading skeleton instead of the duration.
   */
  loading?: boolean;

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
export const DurationBase = ({ fallback, loading, value, ...rest }: DurationOverriddenProps) => {
  const { parts, error } = useMemo(() => formatDuration(value), [value]);
  return (
    <Root {...rest}>
      {(error || loading || (fallback && value === undefined)) && (
        <Typography variant="body1" loading={loading}>{fallback || 'Invalid'}</Typography>
      )}
      {!error && !loading && parts?.map((part) => (
        <div className='rosen-Duration__part' key={part.value + part.unit}>
          <Typography variant="body1">{part.value}</Typography>
          <Typography
            color="text-primary"
            fontSize="12px"
            style={{ opacity: 0.7 }}
          >
            {part.unit}
            {part.value > 1 ? 's' : ''}
          </Typography>
        </div>
      ))}
    </Root>
  );
};

DurationBase.displayName = 'Duration';

export const Duration = Wrap(DurationBase);

export type DurationProps = ComponentProps<typeof Duration>;
