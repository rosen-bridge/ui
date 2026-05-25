import { useMemo } from 'react';

import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SkeletonOverrides {}

export type SkeletonOwnProps = {
  attached?: boolean;
  height?: (number & {}) | (string & {});
  variant?: 'circular' | 'rounded' | 'text';
  width?: (number & {}) | (string & {});
};

export type SkeletonBaseProps = ElementBaseProps<'span', SkeletonOwnProps>;

export type SkeletonProps = OverridableType<
  SkeletonBaseProps,
  SkeletonOverrides,
  never
>;

export const Skeleton = (props: SkeletonProps) => {
  const {
    attached,
    height,
    style,
    variant = 'text',
    width,
    ...rest
  } = useConfig('Skeleton', props);

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
      >
        &nbsp;
      </span>
      {attached && <>&nbsp;</>}
    </>
  );
};

Skeleton.displayName = 'Skeleton';
