import { Link } from '@/components';
import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

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

export type ActionProps =
  | OverridableType<ActionAsAnchor, ActionOverrides, never>
  | OverridableType<ActionAsButton, ActionOverrides, never>;

export const Action = (props: ActionProps) => {
  const { disabled, ...rest } = useConfig('Action', props);

  const isLink = 'href' in rest;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Component = (isLink ? Link : 'button') as any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
