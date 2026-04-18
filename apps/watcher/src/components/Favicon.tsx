import { useEffect, useRef } from 'react';

import { upperFirst } from 'lodash-es';

import { useInfo } from '@/hooks';
import { Icon, IconProps, useTheme } from '@rosen-bridge/ui-kit';

export const Favicon = () => {
  const ref = useRef<SVGSVGElement>(null);
  
  const { data } = useInfo();
  
  const theme = useTheme();

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
  }, [data, theme.palette.mode]);

  return (
    <Icon 
      ref={ref}
      name={upperFirst(data?.network || 'ExclamationTriangle') as IconProps['name']} 
      style={{ display: 'contents' }}
    />
  )
};
