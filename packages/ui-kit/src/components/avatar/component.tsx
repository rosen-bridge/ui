import { useMemo } from 'react';

import { Avatar as AvatarMUI, type SxProps, type Theme } from '@mui/material';

import { Skeleton } from '@/components';
import { useConfig } from '@/hooks';
import type { Color, ElementBaseProps, OverridableType } from '@/types';
import { toCSSColor } from '@/utils';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AvatarOverrides {}

export type AvatarOwnProps = {
  /** Background color (theme key or raw CSS). */
  background?: Color;

  /** Text color (theme key or raw CSS). */
  color?: Color;

  /** loading state for the component. */
  loading?: boolean;

  /** Avatar size (width/height). */
  size?: (number & {}) | (string & {});
};

export type AvatarBaseProps = ElementBaseProps<'div', AvatarOwnProps>;

export type AvatarProps = OverridableType<
  AvatarBaseProps,
  AvatarOverrides,
  'background' | 'color' | 'size'
>;

/** Theme-aware Avatar component with customizable colors and size. */
export const Avatar = (props: AvatarProps) => {
  const { background, color, loading, size, style, ...rest } = useConfig(
    'Avatar',
    props,
  );

  const sx = useMemo<SxProps<Theme>>(() => {
    return {
      color: toCSSColor(color),
      width: size,
      height: size,
      backgroundColor: toCSSColor(background),
    };
  }, [color, size, background]);

  if (loading) {
    return (
      <Skeleton style={style} width={size} height={size} variant="circular" />
    );
  }

  return <AvatarMUI style={style} sx={sx} {...rest} />;
};

Avatar.displayName = 'Avatar';
