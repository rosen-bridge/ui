// TODO: replace MUI
import { ComponentProps, useMemo } from 'react';

import { ColorOverridden, OverridableType } from '@/@types';
import { Colors, ElementBaseProps, ensureColor, Root, Wrap } from '@/core';
import { Avatar as AvatarMUI, Skeleton, SxProps, Theme } from '@mui/material';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AvatarOverrides { }

export type AvatarOwnProps = {
  /** Background color (theme key or raw CSS). */
  background?: ColorOverridden;

  /** Text color (theme key or raw CSS). */
  color?: ColorOverridden;

  /** loading state for the component. */
  loading?: boolean;

  /** Avatar size (width/height). */
  size?: (number & {}) | (string & {}); // TODO: add predefined sizes
};

export type AvatarBaseProps = ElementBaseProps<'div', AvatarOwnProps>;

export type AvatarOverriddenProps = OverridableType<
  AvatarBaseProps,
  AvatarOverrides,
  'background' | 'color' | 'size'
>;

/** Theme-aware Avatar component with customizable colors and size. */
export const AvatarBase = ({ background, color, loading, size, style, ...rest }: AvatarOverriddenProps) => {
  const sx = useMemo<SxProps<Theme>>(() => {
    return {
      color: color ? ensureColor(color?.replace('-', '.') as Colors) : undefined,
      width: size,
      height: size,
      backgroundColor: background ? ensureColor(background?.replace('-', '.') as Colors) : undefined,
    };
  }, [color, size, background]);

  if (loading) {
    return (
      <Skeleton style={style} width={size} height={size} variant="circular" />
    );
  }

  return <Root as={AvatarMUI} style={style} sx={sx} {...rest} />
};

AvatarBase.displayName = 'Avatar';

export const Avatar = Wrap(AvatarBase);

export type AvatarProps = ComponentProps<typeof Avatar>;
