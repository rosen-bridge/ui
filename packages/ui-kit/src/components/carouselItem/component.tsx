import { useMemo } from 'react';

import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CarouselItemOverrides {}

export type CarouselItemOwnProps = {
  size?: string;
};

export type CarouselItemBaseProps = ElementBaseProps<
  'div',
  CarouselItemOwnProps
>;

export type CarouselItemProps = OverridableType<
  CarouselItemBaseProps,
  CarouselItemOverrides,
  never
>;

/**
 * `CarouselItem` is a flexible container for carousel slides.
 */

export const CarouselItem = (props: CarouselItemProps) => {
  const { size, style, ...rest } = useConfig('CarouselItem', props);

  const styles = useMemo(() => {
    if (!size) return style;
    return { flex: `0 0 ${size}`, ...style };
  }, [size, style]);

  return <div style={styles} {...rest} />;
};

CarouselItem.displayName = 'CarouselItem';
