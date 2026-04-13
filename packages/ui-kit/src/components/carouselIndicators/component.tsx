import { useMemo } from 'react';

import { useCarousel } from '@/components';
import { ElementBaseProps, Wrap } from '@/core';
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

export type CarouselIndicatorsProps = OverridableType<
  CarouselIndicatorsBaseProps,
  CarouselIndicatorsOverrides,
  never
>;

export const CarouselIndicatorsBase = ({
  ...rest
}: CarouselIndicatorsProps) => {
  const api = useCarousel();

  const items = useMemo(() => {
    return Array.from(Array(api.count).keys());
  }, [api.count]);

  return (
    <div {...rest}>
      {items.map((index) => (
        <button
          key={index}
          className={`${api.current === index ? 'active' : ''}`}
          type="button"
          onClick={() => api.scrollTo(index)}
        />
      ))}
    </div>
  );
};

CarouselIndicatorsBase.displayName = 'CarouselIndicators';

export const CarouselIndicators = Wrap(CarouselIndicatorsBase);
