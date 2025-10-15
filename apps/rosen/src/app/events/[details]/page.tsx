'use client';

import { useState } from 'react';

import { Button, Button2, Center, LoadingButton } from '@rosen-bridge/ui-kit';

const Page = () => {
  const [loading, setLoading] = useState<boolean>(false);
  return (
    <Center style={{ minHeight: 'calc(100vh - 224px)' }}>
      <LoadingButton
        size="large"
        color="error"
        variant="outlined"
        loading={loading}
      >
        Sand Button
      </LoadingButton>
      <Button size="large" color="error" variant="outlined">
        Mui buttons
      </Button>
      <Button2 size="large" color="error" variant="outlined" loading={loading}>
        My Button
      </Button2>

      <Button2 onClick={() => setLoading((prevState) => !prevState)}>
        Loading
      </Button2>
    </Center>
  );
};

export default Page;
