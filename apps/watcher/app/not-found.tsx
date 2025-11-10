'use client';

import React from 'react';

import { Center, NotFound as NotFoundComponent } from '@rosen-bridge/ui-kit';

const NotFound = () => {
  return (
    <Center style={{ minHeight: 'calc(100vh - 224px)' }}>
      <NotFoundComponent />
    </Center>
  );
};

export default NotFound;
