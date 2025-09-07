'use client';

import React, { ReactNode } from 'react';

import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Collapse,
  DisclosureState,
  Typography,
} from '@rosen-bridge/ui-kit';

type DetailsProps = {
  title?: string;
  children?: ReactNode;
  action?: ReactNode;
  state?: DisclosureState;
};

export const Section = ({ children, title, action, state }: DetailsProps) => {
  return (
    <Card backgroundColor="background.paper">
      <CardHeader action={action}>
        <CardTitle>
          <Typography variant="h2" color="text.secondary">
            {title}
          </Typography>
        </CardTitle>
      </CardHeader>
      {action ? (
        <CardBody
          style={{
            paddingBottom: state !== 'open' ? '0' : undefined,
          }}
        >
          <Collapse in={state == 'open'} unmountOnExit defaultValue="open">
            {children}
          </Collapse>
        </CardBody>
      ) : (
        <CardBody>{children}</CardBody>
      )}
    </Card>
  );
};
