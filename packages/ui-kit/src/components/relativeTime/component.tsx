import { ComponentProps, useMemo } from 'react';

import { Skeleton, Typography } from '@/components';
import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';
import { calculateRelativeTime } from '@/utils';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface RelativeTimeOverrides {}

export type RelativeTimeOwnProps = {
  /**
   * Optional flag to show loading state.
   */
  loading?: boolean;

  /**
   * The target time to compare with the current time.
   */
  value?: Date | number;
};

export type RelativeTimeBaseProps = ElementBaseProps<
  'div',
  RelativeTimeOwnProps
>;

export type RelativeTimeOverriddenProps = OverridableType<
  RelativeTimeBaseProps,
  RelativeTimeOverrides,
  never
>;

/**
 * A lightweight component to display relative time based on a given timestamp.
 */
export const RelativeTimeBase = ({
  loading,
  value,
  ...rest
}: RelativeTimeOverriddenProps) => {
  const { prefix, number, unit, suffix, displayText } = useMemo(
    () => calculateRelativeTime(value),
    [value],
  );

  return (
    <div {...rest}>
      {loading && <Skeleton attached />}
      {displayText ? (
        <Typography color="text-secondary" variant="body2">
          {displayText}
        </Typography>
      ) : (
        <>
          {prefix && (
            <Typography color="text-secondary" variant="body2">
              {prefix}
            </Typography>
          )}
          <Typography
            color="text-primary"
            sx={{
              fontSize: '18px',
            }}
          >
            {number}
          </Typography>
          {unit && (
            <Typography color="text-secondary" variant="body2">
              {unit}
            </Typography>
          )}
          {suffix && (
            <Typography color="text-secondary" variant="body2">
              {suffix}
            </Typography>
          )}
        </>
      )}
    </div>
  );
};

RelativeTimeBase.displayName = 'RelativeTime';

export const RelativeTime = Wrap(RelativeTimeBase);

export type RelativeTimeProps = ComponentProps<typeof RelativeTime>;
