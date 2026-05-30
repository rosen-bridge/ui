import { Carousel, CarouselItem, CarouselProvider } from '@/components';
import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface VirtualScrollOverrides {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
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
