import { useMemo } from 'react';

import { styled } from '../../../styling';
import { useCarousel } from './useCarousel';

const CarouselIndicatorsRoot = styled('div')(({ theme }) => ({
  'display': 'flex',
  'flexWrap': 'wrap',
  'justifyContent': 'flex-end',
  'alignItems': 'center',
  'gap': '0.5rem',
  '& > button': {
    'backgroundColor': theme.palette.divider,
    'cursor': 'pointer',
    'border': '0',
    'padding': '0',
    'margin': '0',
    'width': '0.5rem',
    'height': '0.5rem',
    'borderRadius': '50%',
    '&.active': {
      backgroundColor: theme.palette.primary.main,
    },
  },
}));

export const CarouselIndicators = () => {
  const api = useCarousel();

  const items = useMemo(() => {
    return Array.from(Array(api.count).keys());
  }, [api.count]);

  return (
    <CarouselIndicatorsRoot>
      {items.map((index) => (
        <button
          key={index}
          className={`${api.current === index ? 'active' : ''}`}
          type="button"
          onClick={() => api.scrollTo(index)}
        />
      ))}
    </CarouselIndicatorsRoot>
  );
};
