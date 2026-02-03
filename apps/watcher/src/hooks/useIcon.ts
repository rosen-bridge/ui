import { useEffect, useState } from 'react';

import * as Icons from '@rosen-bridge/icons';
import { useMediaQuery, useTheme } from '@rosen-bridge/ui-kit';
import { upperFirst } from 'lodash-es';

import { useInfo } from './useInfo';

export const useIcon = (
  mode: 'light' | 'dark' | 'auto' | 'auto-reverse' | 'theme',
) => {
  const { data } = useInfo();
  const theme = useTheme();

  const [icon, setIcon] = useState<string>();

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)', {
    noSsr: true,
  });

  useEffect(() => {
    if (!data) return;

    const key = `${upperFirst(data.network)}Raw` as keyof typeof Icons;

    if (!(key in Icons)) return;

    const isDarkMode =
      mode == 'dark' ||
      (mode == 'auto' && prefersDarkMode) ||
      (mode == 'auto-reverse' && !prefersDarkMode) ||
      (mode == 'theme' && theme.palette.mode === 'dark');

    const icon = Icons[key].replace(
      '<svg ',
      `<svg fill="${isDarkMode ? 'black' : 'white'}" `,
    );

    const blob = new Blob([icon], { type: 'image/svg+xml' });

    const url = URL.createObjectURL(blob);

    setIcon(url);

    return () => {
      setIcon('');
      URL.revokeObjectURL(url);
    };
  }, [data, mode, prefersDarkMode, theme.palette.mode]);

  return icon;
};
