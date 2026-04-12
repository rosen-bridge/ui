import { ComponentProps } from 'react';

import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BadgeOverrides {}

export type BadgeOwnProps = {
  content?: string;
};

export type BadgeBaseProps = ElementBaseProps<'span', BadgeOwnProps>;

export type BadgeOverriddenProps = OverridableType<
  BadgeBaseProps,
  BadgeOverrides,
  never
>;

export const BadgeBase = ({
  children,
  content,
  ...rest
}: BadgeOverriddenProps) => {
  return (
    <span {...rest}>
      {children}
      <span className="RosenBadge-content">{content}</span>
    </span>
  );
};

BadgeBase.displayName = 'Badge';

export const Badge = Wrap(BadgeBase);

export type BadgeProps = ComponentProps<typeof Badge>;
