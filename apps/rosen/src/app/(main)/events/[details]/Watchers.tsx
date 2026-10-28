'use client';

import { Center, Stack, Text, UnderDevelopmentSection } from '@rosen-bridge/ui-kit';

import { Section } from './Section';

export const Watchers = () => {
  return (
    <Section collapsible title="Watchers">
      <Center>
        <Stack align="center" spacing={1}>
          <UnderDevelopmentSection />
          <Text variant="body1">This section is under development!</Text>
          <Text color="text-secondary">We’re working on it.</Text>
        </Stack>
      </Center>
    </Section>
  );
};
