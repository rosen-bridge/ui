import { ReactNode, useCallback, useEffect, useRef } from 'react';

import { styled } from '../../../styling';

const Viewport = styled('div')(() => ({
  'overflow': 'hidden',
  'flexGrow': 1,
  'cursor': 'grab',
  'scroll-snap-type': 'none',
  'overscroll-behavior': 'none',
  '-webkit-overflow-scrolling': 'auto',
}));

const Content = styled('div')(() => ({}));

export type VirtualScrollProps = {
  children?: ReactNode;
};

export const VirtualScroll = ({ children }: VirtualScrollProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);
  const lastX = useRef(0);
  const velocity = useRef(0);
  const rafId = useRef<number | null>(null);

  const cancelMomentum = useCallback(() => {
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
  }, []);

  const momentumScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    velocity.current *= 0.95;
    if (Math.abs(velocity.current) > 0.5) {
      container.scrollLeft -= velocity.current;
      rafId.current = requestAnimationFrame(momentumScroll);
    }
  }, []);

  const endDrag = useCallback(() => {
    const container = containerRef.current;
    if (!isDragging.current || !container) return;

    isDragging.current = false;
    container.style.cursor = 'grab';
    if (Math.abs(velocity.current) < 1) velocity.current = 0;
    momentumScroll();
  }, [momentumScroll]);

  const drag = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!isDragging.current || !container) return;

    const deltaX = clientX - startX.current;
    container.scrollLeft = scrollStart.current - deltaX;
    velocity.current = clientX - lastX.current;
    lastX.current = clientX;
  }, []);

  const startDrag = useCallback(
    (clientX: number) => {
      const container = containerRef.current;
      if (!container) return;

      isDragging.current = true;
      startX.current = clientX;
      lastX.current = clientX;
      scrollStart.current = container.scrollLeft;
      velocity.current = 0;
      cancelMomentum();
      container.style.cursor = 'grabbing';
    },
    [cancelMomentum],
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      drag(event.pageX);
    },
    [drag],
  );

  const handleMouseUp = useCallback(() => {
    endDrag();
  }, [endDrag]);

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (!isDragging.current) return;
      drag(event.touches[0].pageX);
      event.preventDefault();
    },
    [drag],
  );

  const handleTouchEnd = useCallback(() => {
    endDrag();
  }, [endDrag]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  return (
    <Viewport
      ref={containerRef}
      onMouseDown={(event) => startDrag(event.pageX)}
      onTouchStart={(event) => startDrag(event.touches[0].pageX)}
    >
      <Content>{children}</Content>
    </Viewport>
  );
};
