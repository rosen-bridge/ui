import { ComponentProps, useEffect, useRef } from 'react';
import { ElementPropsBase, Root, Wrap } from '../../core';

export type TableGridHeaderPropsBase = ElementPropsBase<'div'>;

export const TableGridHeaderBase = ({ children, ...rest }: TableGridHeaderPropsBase) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = ref.current;

    if (!container) return;

    const sync = () => {
      const header = container.parentElement;

      if (!header?.parentElement) return;

      const columns = Array.from(container.children);

      header.parentElement.style.gridTemplateColumns = columns
        .map((child) => child.getAttribute('data-width') ?? 'auto')
        .join(' ');
    };

    sync();

    const observer = new MutationObserver((mutations) => {
      const mutation = mutations.at(0);

      if (!mutation) return;

      if (mutation.type !== 'childList') return;

      if (!mutation.addedNodes.length && !mutation.removedNodes.length) return;

      requestAnimationFrame(sync);
    });

    observer.observe(container, { childList: true, subtree: false });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <Root {...rest}>
      <div ref={ref} style={{ display: 'contents' }}>
        {children}
      </div>
    </Root>
  )
};

TableGridHeaderBase.displayName = 'TableGridHeader';

export const TableGridHeader = Wrap(TableGridHeaderBase);

export type TableGridHeaderProps = ComponentProps<typeof TableGridHeader>;
