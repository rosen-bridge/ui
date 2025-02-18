import { PropsWithChildren } from 'react';

import { styled } from '../../../styling';

const CarouselItemRoot = styled('div')(() => ({
  transform: 'translate3d(0, 0, 0)',
  minWidth: '0',
}));

export const CarouselItem = ({
  children,
  size,
}: PropsWithChildren<{ size: string }>) => {
  return (
    <CarouselItemRoot style={{ flex: `0 0 ${size}` }}>
      {children}
    </CarouselItemRoot>
  );
};
