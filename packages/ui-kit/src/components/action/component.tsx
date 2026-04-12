import { ComponentProps } from 'react';

import { Link } from '@/components';
import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ActionOverrides {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type ActionOwnProps = {};

type ActionAsAnchor = ElementBaseProps<
  'a',
  ActionOwnProps & { href: string | undefined; disabled?: boolean }
>;

type ActionAsButton = ElementBaseProps<
  'button',
  ActionOwnProps & { href?: never }
>;

export type ActionBaseProps = ActionAsAnchor | ActionAsButton;

export type ActionOverriddenProps =
  | OverridableType<ActionAsAnchor, ActionOverrides, never>
  | OverridableType<ActionAsButton, ActionOverrides, never>;

export const ActionBase = ({ disabled, ...rest }: ActionOverriddenProps) => {
  const isLink = 'href' in rest;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Component = (isLink ? Link : 'button') as any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const props = { ...rest } as any;

  if (isLink) {
    if (disabled) {
      props['aria-disabled'] = disabled;
    }

    props.tabIndex = disabled ? -1 : rest.tabIndex;

    props.underline = 'none';
  } else {
    props.disabled = disabled;
  }

  return <Component {...props} />;
};

ActionBase.displayName = 'Action';

export const Action = Wrap(ActionBase);

export type ActionProps = ComponentProps<typeof Action>;
