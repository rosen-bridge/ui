'use client';

import Link from 'next/link';

import { Button, Center, Stack } from '@rosen-bridge/ui-kit';
import { UnderDevelop } from '@rosen-bridge/ui-kit';

const Page = () => {
  return (
    <Center style={{ minHeight: 'calc(100vh - 224px)' }}>
      <Stack spacing={4} alignItems="center">
        <UnderDevelop />
        <Link href="/">
          <Button variant="contained">Go Home</Button>
        </Link>
      </Stack>
    </Center>
  );
};

export default Page;
