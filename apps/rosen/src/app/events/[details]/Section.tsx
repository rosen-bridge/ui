'use client';

import { ReactNode } from 'react';

import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Center,
  Collapse,
  DisclosureButton,
  TryAgain,
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
    <Card backgroundColor="background.paper">
      <CardHeader
        action={collapsible && <DisclosureButton disclosure={disclosure} />}
      >
        <CardTitle>
          <Typography variant="h2" color="text.secondary">
            {title}
          </Typography>
        </CardTitle>
      </CardHeader>
      <Collapse in={!collapsible || disclosure.state == 'open' || !!error}>
        <CardBody>
          {!error && children}
          {!!error && (
            <Center style={{ height: '20rem' }}>
              <TryAgain onClick={() => load?.()} />
            </Center>
          )}
        </CardBody>
      </Collapse>
    </Card>
  );
};
