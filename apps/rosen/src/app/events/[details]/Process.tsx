'use client';

import { Center, Stack, Typography } from '@rosen-bridge/ui-kit';

import { Section } from './Section';

export const Process = () => {
  return (
    <Section collapsible title="Progress">
      <Center>
        <Stack
          direction="row"
          align="center"
          spacing={1}
          style={{ height: '100px' }}
        >
          <Typography
            align="center"
            fontWeight="bold"
            variant="h5"
            color="primary"
          >
            Section is under develop
          </Typography>
        </Stack>
      </Center>
    </Section>
  );
};
