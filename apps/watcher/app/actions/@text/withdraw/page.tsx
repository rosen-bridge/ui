'use client';

import React from 'react';

import { Typography } from '@rosen-bridge/ui-kit';

import { ActionText } from '../../ActionText';

const WithdrawalText = () => {
  return (
    <ActionText title="Withdrawal">
      <Typography gutterBottom>
        All your watcher rewards are being deposited to the watcher wallet. You
        can withdraw your reward tokens to any address. Remember to maintain a
        sufficient balance of ERGs in your wallet to ensure uninterrupted
        operation.
      </Typography>
      <Typography fontWeight="bold" sx={{ mt: 2 }}>
        Caution
      </Typography>
      <Typography sx={{ mt: 2 }}>
        DO NOT send your WID token to any other addresses. Otherwise, your
        watcher won&apos;t work correctly anymore. Transferring the WID token to
        a different address will result in moving all your permits to the new
        address, along with any associated rewards and collateral.
      </Typography>
    </ActionText>
  );
};

export default WithdrawalText;
