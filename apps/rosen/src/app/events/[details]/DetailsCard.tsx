'use client';

import React, { ReactNode } from 'react';

import {
  Card2,
  Card2Body,
  Card2Header,
  Card2Title,
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
    <Card2 backgroundColor="background.paper">
      <Card2Header action={action}>
        <Card2Title>
          <Typography
            letterSpacing={0.15}
            lineHeight="24px"
            variant="h3"
            fontSize="20px"
            color="text.secondary"
          >
            {title}
          </Typography>
        </Card2Title>
      </Card2Header>
      {action ? (
        <Card2Body
          style={{
            paddingBottom: state !== 'open' ? '0' : undefined,
          }}
        >
          <Collapse in={state == 'open'} unmountOnExit defaultValue="open">
            {children}
          </Collapse>
        </Card2Body>
      ) : (
        <Card2Body>{children}</Card2Body>
      )}
    </Card2>
  );
};
