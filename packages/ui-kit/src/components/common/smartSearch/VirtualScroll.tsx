'use client';

import { ReactNode, useCallback, useEffect, useRef } from 'react';

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

  // === pointer events unified handling ===
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      container.setPointerCapture(e.pointerId);
      startDrag(e.clientX);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      drag(e.clientX);
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!isDragging.current) return;
      container.releasePointerCapture(e.pointerId);
      endDrag();
    };

    container.addEventListener('pointerdown', handlePointerDown);
    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerup', handlePointerUp);

    return () => {
      container.removeEventListener('pointerdown', handlePointerDown);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerup', handlePointerUp);
    };
  }, [drag, endDrag, startDrag]);

  return (
    <div
      style={{
        overflow: 'hidden',
        flexGrow: 1,
        cursor: 'grab',
        scrollSnapType: 'none',
        overscrollBehavior: 'none',
        WebkitOverflowScrolling: 'auto',
        touchAction: 'none',
      }}
      ref={containerRef}
    >
      <div>{children}</div>
    </div>
  );
};
