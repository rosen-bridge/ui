'use client';

import type { ReactNode } from 'react';

import {
  Badge,
  Button,
  Card,
  CardAction,
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
  action?: ReactNode;
  badge?: string;
  children?: ReactNode;
  collapsible?: boolean;
  error?: unknown;
  load?: () => void;
  title?: string;
  onOpenChange?: (open: boolean) => void;
};

export const Section = ({
  action,
  badge,
  children,
  collapsible,
  error,
  load,
  title,
  onOpenChange,
}: SectionProps) => {
  const disclosure = useDisclosure({
    onClose: async () => {
      onOpenChange?.(false);
    },
    onOpen: async () => {
      onOpenChange?.(true);
      load?.();
    },
  });

  return (
    <Card variant="section">
      <CardHeader>
        <CardTitle variant="h2" color="text-secondary">
          {badge ? <Badge content={badge}>{title}</Badge> : title}
        </CardTitle>
        <CardAction>
          {action}
          {collapsible && <DisclosureButton disclosure={disclosure} />}
        </CardAction>
      </CardHeader>
      <Collapsible open={!collapsible || disclosure.state === 'open' || !!error}>
        <CardBody style={{ paddingTop: 0 }}>
          {!error && children}
          {!!error && (
            <Center style={{ height: '20rem' }}>
              <Button variant="text" onClick={() => load?.()}>
                <Stack direction="column" align="center">
                  <Icon color="error" name="SyncExclamation" />
                  <Typography color="error">TRY AGAIN!</Typography>
                </Stack>
              </Button>
            </Center>
          )}
        </CardBody>
      </Collapsible>
    </Card>
  );
};
