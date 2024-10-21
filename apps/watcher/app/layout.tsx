'use client';

import React, { useEffect } from 'react';
import App from './App';
import useInfo from './_hooks/useInfo';

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  const { data: info, isLoading } = useInfo();

  useEffect(() => {
    const capitalizeFirstLetter = (network: string) =>
      network.charAt(0).toUpperCase() + network.slice(1);

    const networkTitle = isLoading
      ? 'Watcher'
      : `[${info?.network ? capitalizeFirstLetter(info.network) : ''}] Watcher`;

    document.title = networkTitle;
  }, [isLoading, info]);

  return (
    /**
     * TODO: get `lang` from url language path segment
     * local:ergo/rosen-bridge/ui#13
     */
    <html lang="en">
      <body>
        <App>{children}</App>
      </body>
    </html>
  );
};

export default RootLayout;
