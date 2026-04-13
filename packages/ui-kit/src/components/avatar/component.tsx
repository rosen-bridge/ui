import { useMemo } from 'react';

import { Avatar as AvatarMUI, SxProps, Theme } from '@mui/material';

import { Skeleton } from '@/components';
import { ElementBaseProps, Wrap } from '@/core';
import { Color, OverridableType } from '@/types';
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
export const AvatarBase = ({
  background,
  color,
  loading,
  size,
  style,
  ...rest
}: AvatarProps) => {
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

AvatarBase.displayName = 'Avatar';

export const Avatar = Wrap(AvatarBase);
