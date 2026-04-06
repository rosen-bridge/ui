import { ComponentProps, useMemo } from 'react';

import { Breakpoint } from '@mui/material';

import { ElementBaseProps, Wrap } from '@/core';
import { useCurrentBreakpoint } from '@/hooks';
import { OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CarouselItemOverrides {}

export type CarouselItemOwnProps = {
  size: string | Partial<Record<Breakpoint, string>>;
};

export type CarouselItemBaseProps = ElementBaseProps<
  'div',
  CarouselItemOwnProps
>;

export type CarouselItemOverriddenProps = OverridableType<
  CarouselItemBaseProps,
  CarouselItemOverrides,
  never
>;

/**
 * `CarouselItem` is a flexible container for carousel slides.
 * It accepts a `size` prop that controls the responsive width of the item.
 *
 * If `size` is a string, it applies the same width at all breakpoints.
 * If `size` is an object, it applies a different width per custom breakpoint.
 *
 * The resolved width will follow this priority:
 *  - If there is a size for the current breakpoint, use it.
 *  - If not, fallback to `desktop` size if provided.
 *  - If none provided, fallback to `'100%'`.
 *
 * @example
 * ```tsx
 * <CarouselItem size={`clamp(190px, calc(100% - 0.75rem),20%})`} >Slide Content</CarouselItem>
 *
 * <CarouselItem size="300px" >Slide Content</CarouselItem>
 *
 * <CarouselItem
 *   size={{
 *     mobile: '80%',
 *     tablet: '50%',
 *     laptop: '33%',
 *     desktop: '25%',
 *   }}
 * >
 *   Slide Content
 * </CarouselItem>
 * ```
 *
 * @param size A string for fixed width, or a partial map of breakpoints to widths.
 */

export const CarouselItemBase = ({
  size,
  style,
  ...rest
}: CarouselItemOverriddenProps) => {
  const currentBreakpoint = useCurrentBreakpoint();

  const styles = useMemo(() => {
    let result = '';

    if (typeof size === 'string') {
      result = size;
    } else if (currentBreakpoint && size[currentBreakpoint]) {
      result = size[currentBreakpoint];
    } else {
      result = size.desktop ?? '100%';
    }

    return { flex: `0 0 ${result}`, ...style };
  }, [currentBreakpoint, size, style]);

  return <div style={styles} {...rest} />;
};

CarouselItemBase.displayName = 'CarouselItem';

export const CarouselItem = Wrap(CarouselItemBase);

export type CarouselItemProps = ComponentProps<typeof CarouselItem>;
