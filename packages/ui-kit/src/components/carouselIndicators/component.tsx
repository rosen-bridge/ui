import { ComponentProps, useMemo } from 'react';

import { useCarousel } from '@/components';
import { ElementBaseProps, Root, Wrap } from '@/core';
import { OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CarouselIndicatorsOverrides {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type CarouselIndicatorsOwnProps = {};

export type CarouselIndicatorsBaseProps = ElementBaseProps<
  'div',
  CarouselIndicatorsOwnProps
>;

export type CarouselIndicatorsOverriddenProps = OverridableType<
  CarouselIndicatorsBaseProps,
  CarouselIndicatorsOverrides,
  never
>;

export const CarouselIndicatorsBase = ({
  ...rest
}: CarouselIndicatorsOverriddenProps) => {
  const api = useCarousel();

  const items = useMemo(() => {
    return Array.from(Array(api.count).keys());
  }, [api.count]);

  return (
    <Root {...rest}>
      {items.map((index) => (
        <button
          key={index}
          className={`${api.current === index ? 'active' : ''}`}
          type="button"
          onClick={() => api.scrollTo(index)}
        />
      ))}
    </Root>
  );
};

CarouselIndicatorsBase.displayName = 'CarouselIndicators';

export const CarouselIndicators = Wrap(CarouselIndicatorsBase);

export type CarouselIndicatorsProps = ComponentProps<typeof CarouselIndicators>;
