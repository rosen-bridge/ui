import { useContext } from 'react';

import { CarouselContext } from './context';

export const useCarousel = () => {
  const context = useContext(CarouselContext);

  if (!context) {
    throw new Error('useCarousel must be used within CarouselProvider');
  }

  return context;
};
