import { ComponentProps, ReactNode } from 'react';

import { Button as ButtonMUI } from '@mui/material';

import { ElementBaseProps, Wrap } from '@/core';
import { ColorOverridden, OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ButtonOverrides {}

export type ButtonOwnProps = {
  block?: boolean;
  color?: ColorOverridden;
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  variant?: 'outlined' | 'contained' | 'text';
};

export type ButtonBaseProps = ElementBaseProps<'button', ButtonOwnProps>;

export type ButtonOverriddenProps = OverridableType<
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
}: ButtonOverriddenProps) => {
  color;
  loading;
  startIcon;
  endIcon;
  return (
    <ButtonMUI data-block={!!block} color={color as any} loading={loading} size={size} startIcon={startIcon} endIcon={endIcon} variant={variant} {...rest} />
    // TODO
    // <Action data-block={!!block} data-size={size} data-variant={variant} {...rest} />
  );
};

ButtonBase.displayName = 'Button';

export const Button = Wrap(ButtonBase);

export type ButtonProps = ComponentProps<typeof Button>;
