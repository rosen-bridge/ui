import { useEffect, useRef } from 'react';

import { Icon, type IconProps } from '@rosen-bridge/ui-kit';
import { upperFirst } from 'lodash-es';

import { useInfo } from '@/hooks';

export const Favicon = () => {
  const ref = useRef<SVGSVGElement>(null);

  const { data } = useInfo();

  /**
   * TODO: In the next phase, refactor this React hook to utilize SSR and data fetching
   * local:ergo/rosen-bridge/ui#408
   */
  useEffect(() => {
    document.title = `Watcher`;

    if (!data) return;

    document.title = `[${upperFirst(data.network)}] Watcher`;

    if (!ref.current?.outerHTML) return;

    const blob = new Blob([ref.current.outerHTML], { type: 'image/svg+xml' });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('link');

    link.rel = 'icon';
    link.href = url;

    document.head.appendChild(link);

    return () => {
      URL.revokeObjectURL(url);
      document.head.removeChild(link);
    };
  }, [data]);

  return (
    <Icon
      ref={ref}
      name={
        upperFirst(data?.network || 'ExclamationTriangle') as IconProps['name']
      }
      style={{ display: 'contents' }}
    />
  );
};
