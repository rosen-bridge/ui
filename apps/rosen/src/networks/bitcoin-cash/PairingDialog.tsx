'use client';

import { useSyncExternalStore } from 'react';

import {
  Button,
  Dialog,
  DialogBody,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  QRCodeCanvas,
  Stack,
} from '@rosen-bridge/ui-kit';

import { bitcoinCashPairing } from './pairing';

/** Display one active Cashonize proposal and require confirmation of its signable account. */
export const BitcoinCashPairingDialog = () => {
  const state = useSyncExternalStore(
    bitcoinCashPairing.subscribe,
    bitcoinCashPairing.getSnapshot,
    bitcoinCashPairing.getSnapshot,
  );
  return (
    <Dialog
      open={!!state.uri || !!state.address}
      width="small"
      onClose={() => void bitcoinCashPairing.cancel()}
    >
      <DialogHeader>
        <DialogTitle>Connect Cashonize</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <Stack align="center" spacing={2}>
          {state.uri && (
            <>
              <DialogDescription>
                Scan this code in Cashonize to approve the connection.
              </DialogDescription>
              <QRCodeCanvas size={200} value={state.uri} />
            </>
          )}
          {state.address && (
            <>
              <DialogDescription>
                Confirm the Bitcoin Cash account approved by your wallet.
              </DialogDescription>
              <div style={{ overflowWrap: 'anywhere' }}>{state.address}</div>
              <Button onClick={bitcoinCashPairing.confirm}>Use this account</Button>
            </>
          )}
          <Button onClick={() => void bitcoinCashPairing.cancel()}>Cancel</Button>
        </Stack>
      </DialogBody>
    </Dialog>
  );
};
