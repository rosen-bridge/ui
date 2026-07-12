import { Link } from '@/components';
import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

export interface ActionOverrides {}

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

export type ActionProps =
  | OverridableType<ActionAsAnchor, ActionOverrides, never>
  | OverridableType<ActionAsButton, ActionOverrides, never>;

export const Action = (props: ActionProps) => {
  const { disabled, ...rest } = useConfig('Action', props);

  const isLink = 'href' in rest;

  // biome-ignore lint/suspicious/noExplicitAny: Use a better type
  const Component = (isLink ? Link : 'button') as any;

  // biome-ignore lint/suspicious/noExplicitAny: Use a better type
  const next = { ...rest } as any;

  if (isLink) {
    if (disabled) {
      next['aria-disabled'] = disabled;
    }

    next.tabIndex = disabled ? -1 : rest.tabIndex;

    next.underline = 'none';
  } else {
    next.disabled = disabled;
  }

  return <Component {...next} />;
};

Action.displayName = 'Action';
