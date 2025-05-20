'use client';

// import {
//   BalanceProvider,
//   MaxTransferProvider,
//   NetworkProvider,
//   TransactionFeesProvider,
//   WalletProvider,
// } from '@/_hooks';
import BridgeForm from './BridgeForm';

// import PageLegacy from './PageLegacy';

const RosenBridge = () => {
  return (
    <>
      {/* <NetworkProvider>
        <WalletProvider>
          <BalanceProvider>
            <MaxTransferProvider>
              <TransactionFeesProvider> */}
      <BridgeForm />
      {/* </TransactionFeesProvider>
            </MaxTransferProvider>
          </BalanceProvider>
        </WalletProvider>
      </NetworkProvider> */}
      {/* <PageLegacy /> */}
    </>
  );
};

export default RosenBridge;
