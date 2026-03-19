import { ComponentProps } from 'react';

import { ElementBaseProps, Root, Wrap } from '@/core';
import { OverridableType } from '@/types';

import { useCarousel } from './hook';
import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CarouselOverrides {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type CarouselOwnProps = {};

export type CarouselBaseProps = ElementBaseProps<'div', CarouselOwnProps>;

export type CarouselOverriddenProps = OverridableType<
  CarouselBaseProps,
  CarouselOverrides,
  never
>;

export const CarouselBase = ({
  children,
  ...rest
}: CarouselOverriddenProps) => {
  const api = useCarousel();
  return (
    <Root {...rest} ref={api.ref}>
      <div className="RosenCarousel-container">{children}</div>
    </Root>
  );
};

CarouselBase.displayName = 'Carousel';

export const Carousel = Wrap(CarouselBase);

export type CarouselProps = ComponentProps<typeof Carousel>;
