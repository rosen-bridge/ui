'use client';

import { ReactNode } from 'react';

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Center,
  Collapsible,
  DisclosureButton,
  Icon,
  Stack,
  Typography,
  useDisclosure,
} from '@rosen-bridge/ui-kit';

export type SectionProps = {
  children?: ReactNode;
  collapsible?: boolean;
  error?: unknown;
  load?: () => void;
  title?: string;
};

export const Section = ({
  children,
  collapsible,
  error,
  load,
  title,
}: SectionProps) => {
  const disclosure = useDisclosure({
    onOpen: () => {
      load?.();
      return Promise.resolve();
    },
  });

  return (
    <Card variant="section" backgroundColor="background.paper">
      <CardHeader
        action={collapsible && <DisclosureButton disclosure={disclosure} />}
      >
        <CardTitle>
          <Typography variant="h2" color="text.secondary">
            {title}
          </Typography>
        </CardTitle>
      </CardHeader>
      <Collapsible open={!collapsible || disclosure.state == 'open' || !!error}>
        <CardBody>
          {!error && children}
          {!!error && (
            <Center style={{ height: '20rem' }}>
              <Button variant="text" onClick={() => load?.()}>
                <Stack direction="column" align="center">
                  <Icon color="error" name="SyncExclamation" />
                  <Typography color="error.main">TRY AGAIN!</Typography>
                </Stack>
              </Button>
            </Center>
          )}
        </CardBody>
      </Collapsible>
    </Card>
  );
};
