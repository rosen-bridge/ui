'use client';

import { Center, DividerNew, Stack } from '@rosen-bridge/ui-kit';
import { UnderDevelop } from '@rosen-bridge/ui-kit';

const Page = () => {
  return (
    <Center style={{ minHeight: 'calc(100vh - 224px)' }}>
      <div style={{ width: '50%', height: '100px' }}>
        <DividerNew
          orientation="vertical"
          style={{ borderStyle: 'dashed', marginTop: '50px' }}
        />
      </div>
    </Center>
  );
};

export default Page;
