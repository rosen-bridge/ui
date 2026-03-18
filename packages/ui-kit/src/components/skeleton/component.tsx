import { ComponentProps } from 'react';

import { Skeleton as SkeletonMUI } from '@mui/material';

import { OverridableType } from '@/@types';
import { ElementBaseProps, Root, Wrap } from '@/core';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SkeletonOverrides {}

export type SkeletonOwnProps = {
  animation?: 'pulse' | 'wave' | false;
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
  animation,
  attached = false,
  height,
  variant = 'text',
  width,
  ...rest
}: SkeletonOverriddenProps) => {
  if (!attached)
    return (
      <SkeletonMUI
        animation={animation}
        height={height}
        variant={variant}
        width={width}
        {...rest}
      />
    );
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

export const Skeleton = Wrap(SkeletonBase);

export type SkeletonProps = ComponentProps<typeof Skeleton>;
