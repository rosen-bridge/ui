import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import useEmblaCarousel from 'embla-carousel-react';

export const CarouselContext = createContext<CarouselContextType | null>(null);

export type CarouselContextType = {
  count: number;
  current: number;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  scrollPrev: () => void;
  scrollNext: () => void;
  scrollTo: (index: number) => void;
  ref: (element: HTMLElement | null) => void;
};

export const useCarousel = () => {
  const context = useContext(CarouselContext);

  if (!context) {
    throw new Error('useCarousel must be used within CarouselProvider');
  }

  return context;
};

export const CarouselProvider = ({ children }: PropsWithChildren) => {
  const [ref, api] = useEmblaCarousel({ dragFree: true });

  const [count, setCount] = useState(0);

  const [current, setCurrent] = useState(0);

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const update = useCallback(() => {
    if (!api) return;

    setCount(api.slideNodes().length || 0);

    setCurrent(api.selectedScrollSnap());

    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, [api]);

  const scrollPrev = useCallback(() => api?.scrollPrev(), [api]);

  const scrollNext = useCallback(() => api?.scrollNext(), [api]);

  const scrollTo = useCallback((index: number) => api?.scrollTo(index), [api]);

  useEffect(() => {
    if (!api) return;

    update();

    api.on('reInit', update);

    api.on('select', update);

    return () => {
      api.off('reInit', update);
      api.off('select', update);
      api.destroy();
    };
  }, [api, update]);

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

  return (
    <CarouselContext.Provider value={state}>
      {children}
    </CarouselContext.Provider>
  );
};
