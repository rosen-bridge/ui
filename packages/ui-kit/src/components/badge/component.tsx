import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BadgeOverrides {}

export type BadgeOwnProps = {
  content?: string;
};

export type BadgeBaseProps = ElementBaseProps<'span', BadgeOwnProps>;

export type BadgeProps = OverridableType<BadgeBaseProps, BadgeOverrides, never>;

export const Badge = (props: BadgeProps) => {
  const { children, content, ...rest } = useConfig('Badge', props);

  return (
    <span {...rest}>
      {children}
      <span className="RosenBadge-content">{content}</span>
    </span>
  );
};

Badge.displayName = 'Badge';
