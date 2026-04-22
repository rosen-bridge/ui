import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

import { useCarousel } from './hook';
import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CarouselOverrides {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
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
