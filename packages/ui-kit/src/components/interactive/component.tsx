import { ComponentProps } from 'react';

import { ButtonBase as ButtonBaseMUI } from '@mui/material';

import { Link } from '@/components';
import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface InteractiveOverrides {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type InteractiveOwnProps = {};

type InteractiveAsAnchor = ElementBaseProps<
  'a',
  InteractiveOwnProps & { href: string | undefined }
>;

type InteractiveAsButton = ElementBaseProps<
  'button',
  InteractiveOwnProps & { href?: never }
>;

export type InteractiveBaseProps = InteractiveAsAnchor | InteractiveAsButton;

export type InteractiveOverriddenProps =
  | OverridableType<InteractiveAsAnchor, InteractiveOverrides, never>
  | OverridableType<InteractiveAsButton, InteractiveOverrides, never>;

export const InteractiveBase = ({ ...rest }: InteractiveOverriddenProps) => {
  const isLink = 'href' in rest;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Component = (isLink ? Link : 'button') as any;

  return (
    <ButtonBaseMUI
      component={Component}
      {...(isLink ? { underline: 'none' } : {})}
      {...rest}
    />
  );
};

InteractiveBase.displayName = 'Interactive';

export const Interactive = Wrap(InteractiveBase);

export type InteractiveProps = ComponentProps<typeof Interactive>;
