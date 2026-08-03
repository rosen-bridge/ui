import { Carousel, CarouselItem, CarouselProvider } from '@/components';
import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

export interface VirtualScrollOverrides {}

export type VirtualScrollOwnProps = {};

export type VirtualScrollBaseProps = ElementBaseProps<
  'div',
  VirtualScrollOwnProps
>;

export type VirtualScrollProps = OverridableType<
  VirtualScrollBaseProps,
  VirtualScrollOverrides,
  never
>;

export const VirtualScroll = (props: VirtualScrollProps) => {
  const { children, ...rest } = useConfig('VirtualScroll', props);
  return (
    <CarouselProvider>
      <Carousel {...rest}>
        <CarouselItem>{children}</CarouselItem>
        <CarouselItem />
      </Carousel>
    </CarouselProvider>
  );
};

VirtualScroll.displayName = 'VirtualScroll';
