import { useMemo } from 'react';

import { Icon, type IconProps, Skeleton, Typography } from '@/components';
import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';
import { toCSSColor } from '@/utils';

import './styles.css';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ChipOverrides {}

export type ChipOwnProps = {
  label?: string;
  icon?: IconProps['name'];
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral' | 'info';
  loading?: boolean;
};

export type ChipBaseProps = ElementBaseProps<'div', ChipOwnProps>;

export type ChipProps = OverridableType<ChipBaseProps, ChipOverrides, never>;

export const Chip = (props: ChipProps) => {
  const {
    children,
    label,
    loading,
    color = 'primary',
    icon,
    style,
    ...rest
  } = useConfig('Chip', props);

  const styles = useMemo(
    () => ({
      '--rosen-chip-color': toCSSColor(`${color}-light`),
      '--rosen-chip-text-color': toCSSColor(`${color}-dark`),
      ...style,
    }),
    [color, style],
  );

  const content =
    children ??
    (label ? (
      <Typography color="inherit" variant="body2">
        {label}
      </Typography>
    ) : (
      'Invalid'
    ));

  return (
    <div style={styles} {...rest}>
      {icon && <Icon name={icon} color={`${color}-dark`} style={{ marginRight: '4px' }} />}
      {content}
      {loading && <Skeleton variant="rounded" attached height={32} />}
    </div>
  );
};

Chip.displayName = 'Chip';
