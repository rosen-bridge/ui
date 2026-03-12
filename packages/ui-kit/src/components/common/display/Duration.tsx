import { ComponentProps, forwardRef, HTMLAttributes, useMemo } from 'react';

import { Skeleton, Typography } from '@mui/material';

import { Icon } from '@/components/icon';

import { formatDuration } from '../../../utils';
import { Stack } from '../../stack';
import { InjectOverrides } from '../InjectOverrides';

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

/**
 * A component for displaying duration values in a human-readable format.
 * It handles loading, invalid values, and fallback states automatically.
 */
const DurationBase = forwardRef<HTMLDivElement, DurationBaseProps>(
  (props, ref) => {
    const { fallBack, loading, value } = props;

    const { parts, error } = useMemo(() => formatDuration(value), [value]);

    return (
      <Stack direction="row" spacing={1} ref={ref} {...props}>
        {loading ? (
          <Skeleton width={80} variant="text" />
        ) : error ? (
          <Icon name="ExclamationTriangle" size="small" />
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
