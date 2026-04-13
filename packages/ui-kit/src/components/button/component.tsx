import { ReactNode } from 'react';

import { Button as ButtonMUI } from '@mui/material';

import { ElementBaseProps, Wrap } from '@/core';
import { Color, OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ButtonOverrides {}

export type ButtonOwnProps = {
  block?: boolean;
  color?: Color;
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  variant?: 'outlined' | 'contained' | 'text';
};

export type ButtonBaseProps = ElementBaseProps<'button', ButtonOwnProps>;

export type ButtonProps = OverridableType<
  ButtonBaseProps,
  ButtonOverrides,
  'color'
>;

export const ButtonBase = ({
  block,
  color = 'primary',
  loading,
  size = 'medium',
  startIcon,
  endIcon,
  variant = 'text',
  ...rest
}: ButtonProps) => {
  void color;
  void loading;
  void startIcon;
  void endIcon;
  return (
    <ButtonMUI
      data-block={!!block}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      color={color as any}
      loading={loading}
      size={size}
      startIcon={startIcon}
      endIcon={endIcon}
      variant={variant}
      {...rest}
    />
    // TODO
    // <Action data-block={!!block} data-size={size} data-variant={variant} {...rest} />
  );
};

ButtonBase.displayName = 'Button';

export const Button = Wrap(ButtonBase);
