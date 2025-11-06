'use client';

import { Center, Stack, Typography } from '@rosen-bridge/ui-kit';

import { Section } from './Section';

export const SourceTx = () => {
  return (
    <Section collapsible title="Source Tx Metadata">
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
