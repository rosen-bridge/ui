import { useMemo } from 'react';

import { Skeleton, Typography } from '@/components';
import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';
import { calculateRelativeTime } from '@/utils';

import './styles.css';

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

export type RelativeTimeBaseProps = ElementBaseProps<'div', RelativeTimeOwnProps>;

export type RelativeTimeProps = OverridableType<
  RelativeTimeBaseProps,
  RelativeTimeOverrides,
  never
>;

/**
 * A lightweight component to display relative time based on a given timestamp.
 */
export const RelativeTime = (props: RelativeTimeProps) => {
  const { loading, value, ...rest } = useConfig('RelativeTime', props);

  const { prefix, number, unit, suffix, displayText } = useMemo(
    () => calculateRelativeTime(value),
    [value],
  );

  return (
    <div {...rest}>
      {loading && <Skeleton attached />}
      {displayText ? (
        <Typography color="text-primary">{displayText}</Typography>
      ) : (
        <>
          {prefix && (
            <Typography color="text-secondary" variant="body3">
              {prefix}
            </Typography>
          )}
          <Typography color="text-primary">{number}</Typography>
          {unit && (
            <Typography color="text-secondary" variant="body3">
              {unit}
            </Typography>
          )}
          {suffix && (
            <Typography color="text-secondary" variant="body3">
              {suffix}
            </Typography>
          )}
        </>
      )}
    </div>
  );
};

RelativeTime.displayName = 'RelativeTime';
