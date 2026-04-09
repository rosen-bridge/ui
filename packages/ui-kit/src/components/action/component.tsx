import { ComponentProps } from 'react';

import { ButtonBase as ButtonBaseMUI } from '@mui/material';

import { Link } from '@/components';
import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ActionOverrides {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type ActionOwnProps = {};

type ActionAsAnchor = ElementBaseProps<
  'a',
  ActionOwnProps & { href: string | undefined }
>;

type ActionAsButton = ElementBaseProps<
  'button',
  ActionOwnProps & { href?: never }
>;

export type ActionBaseProps = ActionAsAnchor | ActionAsButton;

export type ActionOverriddenProps =
  | OverridableType<ActionAsAnchor, ActionOverrides, never>
  | OverridableType<ActionAsButton, ActionOverrides, never>;

export const ActionBase = ({ ...rest }: ActionOverriddenProps) => {
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

ActionBase.displayName = 'Action';

export const Action = Wrap(ActionBase);

export type ActionProps = ComponentProps<typeof Action>;
