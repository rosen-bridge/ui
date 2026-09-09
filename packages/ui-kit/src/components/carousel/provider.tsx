import { type PropsWithChildren, useEffect, useState } from 'react';

import useEmblaCarousel from 'embla-carousel-react';

import { CarouselContext } from './context';

export const CarouselProvider = ({ children }: PropsWithChildren) => {
  const [ref, api] = useEmblaCarousel({ dragFree: true });

  const [count, setCount] = useState(0);

  const [current, setCurrent] = useState(0);

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = () => api?.scrollPrev();

  const scrollNext = () => api?.scrollNext();

  const scrollTo = (index: number) => api?.scrollTo(index);

  useEffect(() => {
    if (!api) return;

    const update = () => {
      setCount(api.slideNodes().length || 0);

      setCurrent(api.selectedScrollSnap());

      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };

    update();

    api.on('reInit', update);

    api.on('select', update);

    return () => {
      api.off('reInit', update);
      api.off('select', update);
      api.destroy();
    };
  }, [api]);

  const state = {
    count,
    current,
    canScrollPrev,
    canScrollNext,
    scrollPrev,
    scrollNext,
    scrollTo,
    ref,
  };

  return <CarouselContext.Provider value={state}>{children}</CarouselContext.Provider>;
};
