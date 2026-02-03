'use client';

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
      <Typography component="div" sx={{ mt: 2 }}>
        To secure your assets, send two of your three WID tokens to another
        wallet (preferably a cold wallet) as soon as possible after setting up
        this Watcher.
        <ul>
          <li>
            <strong>Do not</strong> send all three WIDs—you must keep one here
            for your Watcher to function correctly.
          </li>
          <li>
            <strong>Moving all WIDs</strong> transfers your permits, rewards,
            and collateral to the new address.
          </li>
        </ul>
        To unlock permits, move one WID back here, unlock, and then immediately
        send it back to your secure wallet. This keeps your assets protected.
      </Typography>
    </ActionText>
  );
};

export default WithdrawalText;
