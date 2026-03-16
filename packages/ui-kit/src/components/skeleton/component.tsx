import { ComponentProps } from 'react';

import { OverridableType } from '@/@types';
import { ElementBaseProps, Root, Wrap } from '@/core';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SkeletonOverrides {}

export type SkeletonOwnProps = {
  attached?: boolean;
  height?: (number & {}) | (string & {});
  variant?: 'circular' | 'rounded' | 'text';
  width?: (number & {}) | (string & {});
};

export type SkeletonBaseProps = ElementBaseProps<'div', SkeletonOwnProps>;

export type SkeletonOverriddenProps = OverridableType<
  SkeletonBaseProps,
  SkeletonOverrides,
  never
>;

export const SkeletonBase = ({
  attached = false,
  height,
  variant = 'text',
  width,
  ...rest
}: SkeletonOverriddenProps) => {
  return (
    <>
      <Root
        reflects={{ attached, variant }}
        styles={{ height, width }}
        {...rest}
      />
      {attached && <>&nbsp;</>}
    </>
  );
};

SkeletonBase.displayName = 'Skeleton';

export const Skeleton2 = Wrap(SkeletonBase);

export type SkeletonProps2 = ComponentProps<typeof Skeleton2>;
