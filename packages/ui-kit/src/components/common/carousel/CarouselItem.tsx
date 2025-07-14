import { PropsWithChildren } from 'react';

import { useCurrentBreakpoint } from '../../../hooks';
import { styled } from '../../../styling';

export type CustomBreakpoint = 'mobile' | 'tablet' | 'laptop' | 'desktop';

type SizeProps = {
  size: string | Partial<Record<CustomBreakpoint, string>>;
};

const CarouselItemRoot = styled('div')(() => ({
  transform: 'translate3d(0, 0, 0)',
  minWidth: '0',
}));
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

export const CarouselItem = ({
  children,
  size,
}: PropsWithChildren<SizeProps>) => {
  const currentBreakpoint = useCurrentBreakpoint();

  let resolvedSize: string;

  if (typeof size === 'string') {
    resolvedSize = size;
  } else if (currentBreakpoint && size[currentBreakpoint]) {
    resolvedSize = size[currentBreakpoint]!;
  } else {
    resolvedSize = size.desktop ?? '100%';
  }

  return (
    <CarouselItemRoot style={{ flex: `0 0 ${resolvedSize}` }}>
      {children}
    </CarouselItemRoot>
  );
};
