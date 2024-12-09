import { Wallet, WalletNext } from '@rosen-ui/wallet-api';

export const createWallet = (newWallet: WalletNext): Wallet => {
  return {
    connectWallet: newWallet.connect.bind(newWallet),
    getAddress: newWallet.getAddress.bind(newWallet),
    getBalance: newWallet.getBalance.bind(newWallet),
    icon: newWallet.icon,
    isAvailable: newWallet.isAvailable.bind(newWallet),
    label: newWallet.label,
    link: newWallet.link,
    name: newWallet.name,
    transfer: (
      token,
      amount,
      toChain,
      address,
      bridgeFee,
      networkFee,
      lockAddress,
    ) =>
      newWallet.transfer.bind(newWallet)({
        address,
        amount,
        bridgeFee,
        lockAddress,
        networkFee,
        toChain,
        token,
      }),
  };
};
