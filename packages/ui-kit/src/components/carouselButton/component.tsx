import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

import { useCarousel } from '../carousel';
import { Icon, IconProps } from '../icon';
import { IconButton } from '../iconButton';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
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

  const canScroll = type == 'next' ? api.canScrollNext : api.canScrollPrev;

  const scroll = type == 'next' ? api.scrollNext : api.scrollPrev;

  return (
    <IconButton disabled={!canScroll} onClick={scroll} {...rest}>
      {type === 'prev' && <Icon name="AngleLeft" {...slots?.prev} />}
      {type === 'next' && <Icon name="AngleRight" {...slots?.next} />}
    </IconButton>
  );
};

CarouselButton.displayName = 'CarouselButton';
