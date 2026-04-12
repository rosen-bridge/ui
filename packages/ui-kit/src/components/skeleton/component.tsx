import { ComponentProps, useMemo } from 'react';

import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SkeletonOverrides {}

export type SkeletonOwnProps = {
  attached?: boolean;
  height?: (number & {}) | (string & {});
  variant?: 'circular' | 'rounded' | 'text';
  width?: (number & {}) | (string & {});
};

export type SkeletonBaseProps = ElementBaseProps<'span', SkeletonOwnProps>;

export type SkeletonOverriddenProps = OverridableType<
  SkeletonBaseProps,
  SkeletonOverrides,
  never
>;

export const SkeletonBase = ({
  attached,
  height,
  style,
  variant = 'text',
  width,
  ...rest
}: SkeletonOverriddenProps) => {
  const styles = useMemo(
    () => ({
      height: typeof height === 'number' ? `${height}px` : height,
      width: typeof width === 'number' ? `${width}px` : width,
      ...style,
    }),
    [height, width, style],
  );

  return (
    <>
      <span
        data-attached={!!attached}
        data-variant={variant}
        style={styles}
        {...rest}
      />
      {attached && <>&nbsp;</>}
    </>
  );
};

SkeletonBase.displayName = 'Skeleton';

export const Skeleton = Wrap(SkeletonBase);

export type SkeletonProps = ComponentProps<typeof Skeleton>;
