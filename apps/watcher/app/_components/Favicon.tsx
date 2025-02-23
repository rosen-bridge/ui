import { useEffect } from 'react';

import { upperFirst } from 'lodash-es';

import { useIcon } from '@/_hooks/useIcon';

import { useInfo } from '../_hooks/useInfo';

export const Favicon = () => {
  const { data } = useInfo();

  const icon = useIcon('auto-reverse');

  /**
   * TODO: In the next phase, refactor this React hook to utilize SSR and data fetching
   * local:ergo/rosen-bridge/ui#408
   */
  useEffect(() => {
    document.title = `Watcher`;

    if (!data) return;

    document.title = `[${upperFirst(data.network)}] Watcher`;

    if (!icon) return;

    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = icon;

    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, [data, icon]);

  return null;
};
