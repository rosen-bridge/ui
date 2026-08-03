'use client';

import type { PropsWithChildren } from 'react';

import { App } from '@rosen-bridge/ui-kit';

import { Sidebar } from './Sidebar';

const RootLayout = ({ children }: PropsWithChildren) => {
  return <App sidebar={<Sidebar />}>{children}</App>;
};

export default RootLayout;
