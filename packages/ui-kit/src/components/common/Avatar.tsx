import { ComponentProps, forwardRef, HTMLAttributes, useMemo } from 'react';

import { Avatar as AvatarMui, Skeleton, Theme } from '@mui/material';
import type { SxProps } from '@mui/material/styles';

import { Colors, ensureColor } from '../../core';
import { InjectOverrides } from './InjectOverrides';

/**
 * Base props for the Avatar component.
 * Supports theme-aware background/text colors and custom sizing.
 */
export type AvatarBaseProps = Omit<HTMLAttributes<HTMLDivElement>, 'color'> & {
  /** Background color (theme key or raw CSS). */
  background?: Colors;

  /** Text color (theme key or raw CSS). */
  color?: Colors;

  /** Avatar size (width/height). */
  size?: number | string;

  /** loading state for the component. */
  loading?: boolean;
};

/** Theme-aware Avatar component with customizable colors and size. */
export const AvatarBase = forwardRef<HTMLDivElement, AvatarBaseProps>(
  (props, ref) => {
    const { background, style, color, loading, size, ...rest } = props;

    const sx = useMemo<SxProps<Theme>>(() => {
      return {
        color: color ? ensureColor(color) : undefined,
        width: size,
        height: size,
        backgroundColor: background ? ensureColor(background) : undefined,
      };
    }, [color, size, background]);

    if (loading) {
      return (
        <Skeleton style={style} width={size} height={size} variant="circular" />
      );
    }

    return <AvatarMui ref={ref} sx={sx} style={style} {...rest} />;
  },
);

AvatarBase.displayName = 'Avatar';

export const Avatar = InjectOverrides(AvatarBase);

export type AvatarProps = ComponentProps<typeof Avatar>;
