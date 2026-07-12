import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import { useCarousel } from './hook';
import './styles.css';

export interface CarouselOverrides {}

export type CarouselOwnProps = {};

export type CarouselBaseProps = ElementBaseProps<'div', CarouselOwnProps>;

export type CarouselProps = OverridableType<
  CarouselBaseProps,
  CarouselOverrides,
  never
>;

export const Carousel = (props: CarouselProps) => {
  const { children, ...rest } = useConfig('Carousel', props);

  const api = useCarousel();

  return (
    <div {...rest} ref={api.ref}>
      <div className="RosenCarousel-container">{children}</div>
    </div>
  );
};

Carousel.displayName = 'Carousel';
