'use client';

import React from 'react';

import { Typography } from '@rosen-bridge/ui-kit';

import ActionText from '../../ActionText';

const WithdrawalText = () => {
  return (
    <ActionText title="Withdraw">
      <Typography gutterBottom>
        All your watcher rewards are deposited to this address, allowing you to
        withdraw your assets at your convenience. Remember to maintain a
        sufficient balance of ERGs in your wallet to ensure uninterrupted
        operation.
      </Typography>
      <Typography fontWeight="bold" sx={{ mt: 2 }}>
        Caution
      </Typography>
      <Typography sx={{ mt: 2 }}>
        DO NOT send your WID token to any other addresses, otherwise your
        watcher won&apos;t work correctly any more. Transferring the WID token
        to a different address will result in the transfer of all your permits
        to the new address, along with any rewards and collateral associated
        with it.
      </Typography>
    </ActionText>
  );
};

export default WithdrawalText;
