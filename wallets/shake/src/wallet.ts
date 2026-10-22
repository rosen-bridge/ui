import { HandshakeNetwork } from '@rosen-network/handshake/dist/client';
import { NETWORKS } from '@rosen-ui/constants';
import type { Network } from '@rosen-ui/types';
import {
  SubmitTransactionError,
  UnsupportedChainError,
  UserDeniedTransactionSignatureError,
  Wallet,
  type WalletTransferParams,
} from '@rosen-ui/wallet-api';

import { ICON } from './icon';
import type { ShakeWalletClient, ShakeWalletConfig } from './types';

const USER_REJECTED_MESSAGE = 'user rejected.';

export class ShakeWallet extends Wallet<ShakeWalletConfig> {
  icon = ICON;

  name = 'Shake';

  label = 'Shake';

  link = 'https://ipfs.hnsproxy.au/shakewallet/';

  currentChain: Network = NETWORKS.handshake.key;

  supportedChains: Network[] = [NETWORKS.handshake.key];

  private client: ShakeWalletClient | null = null;

  private get api() {
    return window.shake!;
  }

  performConnect = async (): Promise<void> => {
    this.client = await this.api.connect();
  };

  performDisconnect = async (): Promise<void> => {
    this.client = null;
  };

  fetchAddress = async (): Promise<string | undefined> => {
    return this.client?.getAddress();
  };

  fetchBalance = async (): Promise<number | undefined> => {
    return (await this.client?.getBalance())?.confirmed;
  };

  isAvailable = (): boolean => {
    return typeof window !== 'undefined' && !!window.shake;
  };

  hasConnection = async (): Promise<boolean> => {
    if (!this.client || (await this.api.isLocked())) return false;

    return !!(await this.fetchAddress());
  };

  performTransfer = async (params: WalletTransferParams): Promise<string> => {
    if (!(this.currentNetwork instanceof HandshakeNetwork)) {
      throw new UnsupportedChainError(this.name, this.currentChain);
    }

    const client = await this.api.connect();

    const lockTx = await this.currentNetwork.generateLockTx(params);

    try {
      const tx = await client.sendRosenBridgeData(lockTx);

      return tx.hash;
    } catch (error) {
      if (error instanceof Error && error.message === USER_REJECTED_MESSAGE) {
        throw new UserDeniedTransactionSignatureError(this.name, error);
      }
      throw new SubmitTransactionError(this.name, error);
    }
  };
}
