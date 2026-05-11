import { useCallback, useEffect, useRef } from 'react';

import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface VirtualScrollOverrides {}

export type VirtualScrollOwnProps = {};

export type VirtualScrollBaseProps = ElementBaseProps<
  'div',
  VirtualScrollOwnProps
>;

export type VirtualScrollProps = OverridableType<
  VirtualScrollBaseProps,
  VirtualScrollOverrides,
  never
>;

export const VirtualScroll = (props: VirtualScrollProps) => {
  const { children, ...rest } = useConfig('VirtualScroll', props);

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
    <div
      ref={containerRef}
      onMouseDown={(event) => startDrag(event.pageX)}
      onTouchStart={(event) => startDrag(event.touches[0].pageX)}
      {...rest}
    >
      <div className="RosenVirtualScroll-content">{children}</div>
    </div>
  );
};

VirtualScroll.displayName = 'VirtualScroll';
