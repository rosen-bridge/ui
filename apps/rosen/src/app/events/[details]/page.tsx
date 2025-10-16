'use client';

import { Center, Stack } from '@rosen-bridge/ui-kit';
import { UnderDevelop } from '@rosen-bridge/ui-kit';

const Page = () => {
  return (
    <Center style={{ minHeight: 'calc(100vh - 224px)' }}>
      <Stack spacing={4} align="center">
        <UnderDevelop />
      </Stack>
    </Center>
  );
};

export default Page;
