import {
  forwardRef,
  ComponentProps,
  useMemo,
  HTMLAttributes,
  ReactNode,
  HTMLAttributeAnchorTarget,
} from 'react';

import { Button as ButtonMui } from '@mui/material';

import { InjectOverrides } from './InjectOverrides';

type ButtonPropsBase = HTMLAttributes<HTMLButtonElement> & {
  block?: boolean;
  color?:
    | 'primary'
    | 'secondary'
    | 'error'
    | 'warning'
    | 'info'
    | 'success'
    | 'inherit';
  disabled?: boolean;
  href?: string;
  target?: HTMLAttributeAnchorTarget;
  type?: 'submit' | 'reset' | 'button';
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  variant?: 'outlined' | 'contained' | 'text';
  form?: string;
};

const ButtonBase = forwardRef<HTMLButtonElement, ButtonPropsBase>(
  (props, ref) => {
    const {
      block,
      children,
      size = 'medium',
      variant = 'text',
      form,
      ...rest
    } = props;

    const sx = useMemo(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = {} as any;

      result.display = block ? 'flex' : 'inline-flex';

      return result;
    }, [block]);

    return (
      <ButtonMui sx={sx} size={size} variant={variant} form={form} ref={ref} {...rest}>
        {children}
      </ButtonMui>
    );
  },
);

ButtonBase.displayName = 'Button';

export const Button = InjectOverrides(ButtonBase);

export type Button = ComponentProps<typeof Button>;
