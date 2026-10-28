import { Text, type TextProps } from '@/components';
import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';
import { formatDuration } from '@/utils';

import './styles.css';

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
    fallback?: TextProps;
    value?: TextProps;
    unit?: TextProps;
  };

  /** Duration in milliseconds; negative, NaN, or non-finite values are errors */
  value?: number;
};

export type DurationBaseProps = ElementBaseProps<'div', DurationOwnProps>;

export type DurationProps = OverridableType<DurationBaseProps, DurationOverrides, never>;

/**
 * A component for displaying duration values in a human-readable format.
 * It handles loading, invalid values, and fallback states automatically.
 */
export const Duration = (props: DurationProps) => {
  const { fallback, loading, slots, value, ...rest } = useConfig('Duration', props);

  const { parts, error } = formatDuration(value);

  const ready = !error && !loading && !(fallback && value === undefined) && parts;

  return (
    <div {...rest}>
      {!ready && (
        <Text as="div" loading={loading} {...slots?.fallback}>
          {fallback || 'Invalid'}
        </Text>
      )}
      {ready &&
        parts.map((part) => (
          <div className="RosenDuration-part" key={part.value + part.unit}>
            <Text variant="body1" as="div" {...slots?.value}>
              {part.value}
            </Text>
            <Text color="text-disabled" as="div" {...slots?.unit}>
              {part.unit}
              {part.value > 1 ? 's' : ''}
            </Text>
          </div>
        ))}
    </div>
  );
};

Duration.displayName = 'Duration';
