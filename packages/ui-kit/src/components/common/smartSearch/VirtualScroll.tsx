import { ReactNode } from 'react';

import { styled } from '../../../styling';

const Viewport = styled('div')(() => ({
  'overflow': 'hidden',
  'overflowX': 'auto',
  'flexGrow': 1,
  '&::-webkit-scrollbar': {
    width: '6px',
    height: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: '#f1f1f1',
    borderRadius: '3px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#888',
    borderRadius: '3px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: '#555',
  },
}));

export type VirtualScrollProps = {
  children?: ReactNode;
};

export const VirtualScroll = ({ children }: VirtualScrollProps) => {
  return <Viewport>{children}</Viewport>;
};
