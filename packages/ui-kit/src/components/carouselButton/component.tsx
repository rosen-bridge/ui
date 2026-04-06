import { ComponentProps } from 'react';

import { Icon, IconButton, IconOverriddenProps } from '@/components';
import { useCarousel } from '@/components';
import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CarouselButtonOverrides {}

export type CarouselButtonOwnProps = {
  slots?: {
    prev?: IconOverriddenProps;
    next?: IconOverriddenProps;
  };
  type: 'next' | 'prev';
};

export type CarouselButtonBaseProps = ElementBaseProps<
  typeof IconButton,
  CarouselButtonOwnProps
>;

export type CarouselButtonOverriddenProps = OverridableType<
  CarouselButtonBaseProps,
  CarouselButtonOverrides,
  never
>;

export const CarouselButtonBase = ({
  slots,
  type,
  ...rest
}: CarouselButtonOverriddenProps) => {
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

export type CarouselButtonProps = ComponentProps<typeof CarouselButton>;
