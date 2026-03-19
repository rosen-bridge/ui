import { createContext } from 'react';

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
