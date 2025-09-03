'use client';

import React, { ReactNode } from 'react';

import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Collapse,
  DisclosureButton,
  DisclosureState,
  Typography,
  useDisclosure,
} from '@rosen-bridge/ui-kit';

type DetailsProps = {
  title?: string;
  children?: ReactNode;
  action?: ReactNode;
  state?: DisclosureState;
};

export const DetailsCard = ({
  children,
  title,
  action,
  state,
}: DetailsProps) => {
  return (
    <Card backgroundColor="background.paper">
      <CardHeader action={action}>
        <CardTitle>
          <Typography
            letterSpacing={0.15}
            lineHeight="24px"
            variant="h3"
            fontSize="20px"
            color="text.secondary"
          >
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
