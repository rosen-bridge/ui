'use client';

import {
  Center,
  Stack,
  Typography,
  UnderDevelopSection,
} from '@rosen-bridge/ui-kit';

import { Section } from './Section';

export const Process = () => {
  return (
    <Section collapsible title="Progress">
      <Center>
        <Stack align="center" spacing={1}>
          <UnderDevelopSection />
          <Typography align="center" variant="body1">
            This section is under development!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            We’re working on it.
          </Typography>
        </Stack>
      </Center>
    </Section>
  );
};
