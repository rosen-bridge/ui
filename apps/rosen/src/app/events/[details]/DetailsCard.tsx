'use client';

import React, { ReactNode } from 'react';

import {
  Card2,
  Card2Body,
  Card2Header,
  Card2Title,
  Typography,
} from '@rosen-bridge/ui-kit';

type DetailsProps = {
  title?: string;
  children?: ReactNode;
};

export const DetailsCard = ({ children, title }: DetailsProps) => {
  return (
    <Card2 backgroundColor="background.paper">
      <Card2Header>
        <Card2Title>
          <Typography
            letterSpacing={0.15}
            lineHeight="24px"
            variant="h2"
            color="text.secondary"
          >
            {title}
          </Typography>
        </Card2Title>
      </Card2Header>
      <Card2Body>{children}</Card2Body>
    </Card2>
  );
};
