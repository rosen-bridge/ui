import { Icon, IconButton, IconProps, useCarousel } from '@/components';
import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

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

export const CarouselButtonBase = ({
  slots,
  type,
  ...rest
}: CarouselButtonProps) => {
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

CarouselButtonBase.displayName = 'CarouselButton';

export const CarouselButton = Wrap(CarouselButtonBase);
