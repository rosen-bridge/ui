'use client';

import React, { ReactNode } from 'react';

import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Collapse,
  DisclosureButton,
  Typography,
  useDisclosure,
} from '@rosen-bridge/ui-kit';

export type SectionProps = {
  children?: ReactNode;
  disclosure?: ReturnType<typeof useDisclosure>;
  title?: string;
};

export const Section = ({ children, disclosure, title }: SectionProps) => {
  return (
    <Card backgroundColor="background.paper">
      <CardHeader
        action={disclosure && <DisclosureButton disclosure={disclosure} />}
      >
        <CardTitle>
          <Typography variant="h2" color="text.secondary">
            {title}
          </Typography>
        </CardTitle>
      </CardHeader>
      {disclosure ? (
        <CardBody
          style={{
            paddingBottom: disclosure.state !== 'open' ? '0' : undefined,
          }}
        >
          <Collapse
            in={disclosure.state == 'open'}
            unmountOnExit
            defaultValue="open"
          >
            {children}
          </Collapse>
        </CardBody>
      ) : (
        <CardBody>{children}</CardBody>
      )}
    </Card>
  );
};
