import { cloneElement, type HTMLAttributes, isValidElement, type ReactElement } from 'react';

import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

export interface SkeletonOverrides {}

type SkeletonTargetProps = HTMLAttributes<HTMLElement> & Record<`data-${string}`, unknown>;

export type SkeletonOwnProps = {
  children?: ReactElement<SkeletonTargetProps>;
  disabled?: boolean;
  height?: (number & {}) | (string & {});
  variant?: 'circular' | 'inherit' | 'rounded' | 'text';
  width?: (number & {}) | (string & {});
};

export type SkeletonBaseProps = ElementBaseProps<'span', SkeletonOwnProps>;

export type SkeletonProps = OverridableType<SkeletonBaseProps, SkeletonOverrides, never>;

const toSize = (value?: number | string) => (typeof value === 'number' ? `${value}px` : value);

export const Skeleton = (props: SkeletonProps) => {
  const {
    children,
    className,
    disabled,
    height,
    style,
    variant = 'text',
    width,
    ...rest
  } = useConfig('Skeleton', props);

  if (disabled) return children;

  if (isValidElement(children)) {
    return cloneElement(children, {
      'aria-busy': true,
      className: [className, children.props.className].filter(Boolean).join(' '),
      'data-skeleton': variant,
      inert: true,
      style: {
        minHeight: toSize(height),
        minWidth: toSize(width),
        ...children.props.style,
        ...style,
      },
    });
  }

  return (
    <span
      aria-hidden
      className={className}
      data-skeleton={variant}
      data-standalone=""
      style={{ height: toSize(height), width: toSize(width), ...style }}
      {...rest}
    >
      &nbsp;
    </span>
  );
};

Skeleton.displayName = 'Skeleton';
