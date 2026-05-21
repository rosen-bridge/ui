import { useMemo } from 'react';

import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

import { useCarousel } from '../carousel';
import './styles.css';

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
