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

  const { prefix, number, unit, suffix, displayText } = calculateRelativeTime(value);

  return (
    <Skeleton disabled={!loading} variant="text">
      <div {...rest}>
        {prefix && (
          <Typography color="text-secondary" variant="body2">
            {prefix}
          </Typography>
        )}
        <Typography
          color={displayText ? 'text-secondary' : 'text-primary'}
          sx={{
            fontSize: '18px',
          }}
        >
          {displayText || number}
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
      </div>
    </Skeleton>
  );
};

RelativeTime.displayName = 'RelativeTime';
