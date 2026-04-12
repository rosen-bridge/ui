import { ComponentProps, useMemo } from 'react';

import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CarouselItemOverrides {}

export type CarouselItemOwnProps = {
  size?: string;
};

export type CarouselItemBaseProps = ElementBaseProps<
  'div',
  CarouselItemOwnProps
>;

export type CarouselItemOverriddenProps = OverridableType<
  CarouselItemBaseProps,
  CarouselItemOverrides,
  never
>;

/**
 * `CarouselItem` is a flexible container for carousel slides.
 */

export const CarouselItemBase = ({
  size,
  style,
  ...rest
}: CarouselItemOverriddenProps) => {
  const styles = useMemo(() => {
    if (!size) return style;
    return { flex: `0 0 ${size}`, ...style };
  }, [size, style]);

  return <div style={styles} {...rest} />;
};

CarouselItemBase.displayName = 'CarouselItem';

export const CarouselItem = Wrap(CarouselItemBase);

export type CarouselItemProps = ComponentProps<typeof CarouselItem>;
