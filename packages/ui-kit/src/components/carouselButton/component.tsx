import { Icon, IconButton, type IconProps, useCarousel } from '@/components';
import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

export interface CarouselButtonOverrides {}

export type CarouselButtonOwnProps = {
  slots?: {
    prev?: IconProps;
    next?: IconProps;
  };
  type: 'next' | 'prev';
};

export type CarouselButtonBaseProps = ElementBaseProps<
  typeof IconButton,
  CarouselButtonOwnProps
>;

export type CarouselButtonProps = OverridableType<
  CarouselButtonBaseProps,
  CarouselButtonOverrides,
  never
>;

export const CarouselButton = (props: CarouselButtonProps) => {
  const { slots, type, ...rest } = useConfig('CarouselButton', props);

  const api = useCarousel();

  const canScroll = type === 'next' ? api.canScrollNext : api.canScrollPrev;

  const scroll = type === 'next' ? api.scrollNext : api.scrollPrev;

  return (
    <IconButton disabled={!canScroll} onClick={scroll} {...rest}>
      {type === 'prev' && <Icon name="AngleLeft" {...slots?.prev} />}
      {type === 'next' && <Icon name="AngleRight" {...slots?.next} />}
    </IconButton>
  );
};

CarouselButton.displayName = 'CarouselButton';
