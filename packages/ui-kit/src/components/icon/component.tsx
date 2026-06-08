import { FC, SVGAttributes, useMemo } from 'react';

import * as Icons from '@rosen-bridge/icons';

import { Skeleton } from '@/components';
import { useConfig } from '@/hooks';
import { Color, ElementBaseProps, OverridableType } from '@/types';
import { toCSSColor, toCSSUnit } from '@/utils';

import './styles.css';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IconOverrides {}

export type IconOwnProps = {
  as?: FC<SVGAttributes<SVGElement>>;
  color?: Color;
  fallback?: Exclude<keyof typeof Icons, 'TOKENS'>;
  icons?: Record<NonNullable<IconProps['name']>, FC<SVGAttributes<SVGElement>>>;
  loading?: boolean;
  name?: Exclude<keyof typeof Icons, 'TOKENS'>;
  size?: 'small' | 'medium' | 'large' | (number & {}) | (string & {});
};

export type IconBaseProps = ElementBaseProps<'svg', IconOwnProps>;

export type IconProps = OverridableType<
  IconBaseProps,
  IconOverrides,
  'color' | 'name' | 'size'
>;

export const Icon = (props: IconProps) => {
  const {
    as,
    color = 'inherit',
    fallback,
    icons,
    loading,
    name,
    size = 'medium',
    style,
    ...rest
  } = useConfig('Icon', props);

  const Icon =
    as ||
    icons?.[name as keyof typeof icons] ||
    icons?.[fallback as keyof typeof icons];

  const styles = useMemo(
    () => ({
      '--rosen-icon-color': toCSSColor(color),
      '--rosen-icon-size': toCSSUnit('icon-size', size),
      ...style,
    }),
    [color, size, style],
  );

  if (loading) {
    return (
      <Skeleton
        className="RosenIcon"
        height={toCSSUnit('icon-size', size)}
        width={toCSSUnit('icon-size', size)}
        variant="circular"
        style={style}
      />
    );
  }

  if (!Icon) {
    console.error(`Icon '${name}' not found`);
    return null;
  }

  return <Icon style={styles} {...rest} />;
};

Icon.displayName = 'Icon';
