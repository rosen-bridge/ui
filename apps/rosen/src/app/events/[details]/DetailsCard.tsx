'use client';

import React, { ReactNode } from 'react';

import {
  Card2,
  Card2Body,
  Card2Header,
  Card2Title,
  Collapse,
  DisclosureButton,
  Typography,
  useDisclosure,
} from '@rosen-bridge/ui-kit';

type DetailsProps = {
  title?: string;
  children?: ReactNode;
  sync?: boolean;
};

export const DetailsCard = ({ children, title, sync }: DetailsProps) => {
  const disclosure = useDisclosure({
    onOpen: () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.5) {
            resolve();
          } else {
            reject();
          }
        }, 500);
      });
    },
  });
  return (
    <Card2 backgroundColor="background.paper">
      <Card2Header
        action={
          sync ? (
            <DisclosureButton disabled={false} disclosure={disclosure} />
          ) : undefined
        }
      >
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
      {sync ? (
        <Card2Body
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
        </Card2Body>
      ) : (
        <Card2Body>{children}</Card2Body>
      )}
    </Card2>
  );
};
