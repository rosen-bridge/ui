import { AngleLeft, AngleRight } from '@rosen-bridge/icons';

import { IconButton, SvgIcon } from '../../base';
import { useCarousel } from './useCarousel';

export const CarouselButton = ({ type }: { type: 'next' | 'prev' }) => {
  const api = useCarousel();

  const canScroll = type == 'next' ? api.canScrollNext : api.canScrollPrev;

  const scroll = type == 'next' ? api.scrollNext : api.scrollPrev;

  const Icon = type == 'next' ? <AngleRight /> : <AngleLeft />;

  return (
    <IconButton disabled={!canScroll} onClick={scroll}>
      <SvgIcon sx={{ width: 24 }}>{Icon}</SvgIcon>
    </IconButton>
  );
};
