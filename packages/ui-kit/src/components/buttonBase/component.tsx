import { ComponentProps } from 'react';

import { ButtonBase as ButtonBaseMUI } from '@mui/material';

import { Link } from '@/components';
import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ButtonBaseOverrides {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type ButtonBaseOwnProps = {};

type ButtonBaseAsAnchor = ElementBaseProps<
  'a',
  ButtonBaseOwnProps & { href: string | undefined }
>;

type ButtonBaseAsButton = ElementBaseProps<
  'button',
  ButtonBaseOwnProps & { href?: never }
>;

export type ButtonBaseBaseProps = ButtonBaseAsAnchor | ButtonBaseAsButton;

export type ButtonBaseOverriddenProps =
  | OverridableType<ButtonBaseAsAnchor, ButtonBaseOverrides, never>
  | OverridableType<ButtonBaseAsButton, ButtonBaseOverrides, never>;

export const ButtonBaseBase = ({ ...rest }: ButtonBaseOverriddenProps) => {
  const isLink = 'href' in rest;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Component = (isLink ? Link : 'button') as any;

  return (
    <ButtonBaseMUI
      component={Component}
      {...(isLink ? { underline: "none" } : {})}
      {...rest}
    />
  );
};

ButtonBaseBase.displayName = 'ButtonBase';

export const ButtonBase = Wrap(ButtonBaseBase);

export type ButtonBaseProps = ComponentProps<typeof ButtonBase>;
