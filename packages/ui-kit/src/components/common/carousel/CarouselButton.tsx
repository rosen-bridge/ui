import { Icon } from '../../icon';
import { IconButton } from '../../iconButton';
import { useCarousel } from './useCarousel';

export const CarouselButton = ({ type }: { type: 'next' | 'prev' }) => {
  const api = useCarousel();

  const canScroll = type == 'next' ? api.canScrollNext : api.canScrollPrev;

  const scroll = type == 'next' ? api.scrollNext : api.scrollPrev;

  return (
    <IconButton disabled={!canScroll} onClick={scroll}>
      <Icon name={type === 'next' ? 'AngleRight' : 'AngleLeft'} />
    </IconButton>
  );
};
