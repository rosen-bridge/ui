'use client';

import React from 'react';

import { Typography } from '@rosen-bridge/ui-kit';

import ActionText from '../../ActionText';

const LockText = () => {
  return (
    <ActionText title="Unlock">
      <Typography gutterBottom>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur.
      </Typography>
      <Typography sx={{ mb: 2 }}>
        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
        officia deserunt mollit anim id est laborum.
      </Typography>
    </ActionText>
  );
};

export default LockText;
