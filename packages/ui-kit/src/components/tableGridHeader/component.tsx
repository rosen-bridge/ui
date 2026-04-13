import { useEffect, useRef } from 'react';

import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TableGridHeaderOverrides {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type TableGridHeaderOwnProps = {};

export type TableGridHeaderBaseProps = ElementBaseProps<
  'div',
  TableGridHeaderOwnProps
>;

export type TableGridHeaderProps = OverridableType<
  TableGridHeaderBaseProps,
  TableGridHeaderOverrides,
  never
>;

export const TableGridHeaderBase = ({
  children,
  ...rest
}: TableGridHeaderProps) => {
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
    <div {...rest}>
      <div ref={ref} style={{ display: 'contents' }}>
        {children}
      </div>
    </div>
  );
};

TableGridHeaderBase.displayName = 'TableGridHeader';

export const TableGridHeader = Wrap(TableGridHeaderBase);
