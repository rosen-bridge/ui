import { PropsWithChildren } from 'react';

import { styled } from '../../../styling';
import { useCarousel } from './useCarousel';

const CarouselViewport = styled('div')(() => ({
  overflow: 'hidden',
}));

const CarouselContainer = styled('div')(() => ({
  display: 'flex',
  touchAction: 'pan-y pinch-zoom',
  gap: '1rem',
}));

export const Carousel = ({ children }: PropsWithChildren) => {
  const api = useCarousel();
  return (
    <CarouselViewport ref={api.ref}>
      <CarouselContainer>{children}</CarouselContainer>
    </CarouselViewport>
  );
};
