import type { ReactNode } from 'react';

import { Button as ButtonMUI } from '@mui/material';

import { Link } from '@/components';
import { useConfig } from '@/hooks';
import type { Color, ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

export interface ButtonOverrides {}

export type ButtonOwnProps = {
  block?: boolean;
  color?: Color;
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  variant?: 'outlined' | 'contained' | 'text';
  target?: string;
  href?: string;
};

export type ButtonBaseProps = ElementBaseProps<'button', ButtonOwnProps>;

export type ButtonProps = OverridableType<
  ButtonBaseProps,
  ButtonOverrides,
  'color'
>;

export const Button = (props: ButtonProps) => {
  const {
    block,
    color = 'primary',
    loading,
    size = 'medium',
    startIcon,
    endIcon,
    variant = 'text',
    ...rest
  } = useConfig('Button', props);

  void color;
  void loading;
  void startIcon;
  void endIcon;

  return (
    <ButtonMUI
      LinkComponent={(props) => <Link underline="none" {...props} />}
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
  );
};

Button.displayName = 'Button';
