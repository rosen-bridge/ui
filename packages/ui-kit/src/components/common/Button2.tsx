import React, { forwardRef, ComponentProps, useMemo, useEffect } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
  IconButton,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

import { ensureColor } from '../../core';
import { InjectOverrides } from './InjectOverrides';

type SizePredefined = 'small' | 'medium' | 'large';
type Name =
  | 'primary'
  | 'secondary'
  | 'error'
  | 'warning'
  | 'info'
  | 'success'
  | 'inherit';
type Button2PropsBase = Omit<
  MuiButtonProps,
  'color' | 'variant' | 'size' | 'sx'
> & {
  color?: Name;
  size?: SizePredefined;
  loadingPosition?: 'start' | 'center' | 'end';
  loading?: boolean;
  variant?: 'default' | 'icon' | 'outlined' | 'contained' | 'text';
};

/**
 * Button2 — A simplified button built on top of MUI Button and IconButton.
 * - Restricts size to small | medium | large
 * - Restricts variant to controlled set
 * - Uses theme-aware color system
 * - Disables external sx usage
 */
const Button2Base = forwardRef<HTMLButtonElement, Button2PropsBase>(
  (props, ref) => {
    const {
      children,
      color,
      loading = false,
      size = 'medium',
      variant = 'default',
      loadingPosition = 'center',
      ...rest
    } = props;

    const sx = useMemo<SxProps<Theme>>(
      () => ({
        color: color && color !== 'inherit' ? ensureColor(color) : undefined,
      }),
      [color],
    );

    const isMuiButton = useMemo(
      () => ['text', 'outlined', 'default', 'contained'].includes(variant),
      [variant],
    );
    useEffect(() => {
      console.log(color);
    }, []);
    const muiVariant = useMemo(() => {
      return variant === 'default'
        ? undefined
        : (variant as 'text' | 'outlined' | 'contained');
    }, [variant]);

    if (isMuiButton && loading) {
      return (
        <LoadingButton
          loading={loading}
          loadingPosition={loadingPosition}
          variant={muiVariant}
          size={size}
          sx={sx}
          ref={ref}
          {...rest}
        >
          {children}
        </LoadingButton>
      );
    }

    return isMuiButton ? (
      <MuiButton
        disabled={loading}
        ref={ref}
        color={color}
        {...rest}
        size={size}
        variant={muiVariant}
        // sx={sx}
      >
        {children}
      </MuiButton>
    ) : (
      <IconButton ref={ref} {...rest} size={size} sx={sx}>
        {children}
      </IconButton>
    );
  },
);

Button2Base.displayName = 'Button2';

export const Button2 = InjectOverrides(Button2Base);
export type Button2 = ComponentProps<typeof Button2>;
