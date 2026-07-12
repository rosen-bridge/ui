import { useMemo } from 'react';

import { useCarousel } from '@/components';
import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

export interface CarouselIndicatorsOverrides {}

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

export const CarouselIndicators = (props: CarouselIndicatorsProps) => {
  const { ...rest } = useConfig('CarouselIndicators', props);

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

CarouselIndicators.displayName = 'CarouselIndicators';
