import { HandshakeNetwork } from '@rosen-network/handshake/dist/client';
import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';
import {
  SubmitTransactionError,
  UnsupportedChainError,
  UserDeniedTransactionSignatureError,
  Wallet,
  WalletTransferParams,
} from '@rosen-ui/wallet-api';

import { ICON } from './icon';
import { ShakeWalletConfig, ShakeWallet as ShakeWalletAPI } from './types';

export class ShakeWallet extends Wallet<ShakeWalletConfig> {
  icon = ICON;

  name = 'Shake Wallet';

  label = 'Shake Wallet';

  link = 'https://ipfs.hnsproxy.au/shakewallet/';

  currentChain: Network = NETWORKS.handshake.key;

  supportedChains: Network[] = [NETWORKS.handshake.key];

  private wallet: ShakeWalletAPI | null = null;

  private get api() {
    return window.shake!;
  }

  performConnect = async (): Promise<void> => {
    this.wallet = await this.api.connect();
  };

  performDisconnect = async (): Promise<void> => {
    this.wallet = null;
  };

  fetchAddress = async (): Promise<string | undefined> => {
    return await this.wallet?.getAddress();
  };

  fetchBalance = async (): Promise<string | undefined> => {
    const balance = await this.wallet?.getBalance();

    return balance?.confirmed.toString();
  };

  isAvailable = (): boolean => {
    return typeof window !== 'undefined' && !!window.shake;
  };

  hasConnection = async (): Promise<boolean> => {
    if (!this.wallet || (await this.api.isLocked())) {
      return false;
    }

    return !!(await this.fetchAddress());
  };

  performTransfer = async (params: WalletTransferParams): Promise<string> => {
    if (!(this.currentNetwork instanceof HandshakeNetwork)) {
      throw new UnsupportedChainError(this.name, this.currentChain);
    }

    try {
      const rosenDataHex = await this.currentNetwork.generateOpReturnData(
        params.toChain,
        params.address,
        params.networkFee.toString(),
        params.bridgeFee.toString(),
      );

      const tokenMap = await this.config.getTokenMap();
      const unwrappedAmount = tokenMap.unwrapAmount(
        params.token.tokenId,
        params.amount,
        NETWORKS.handshake.key,
      ).amount;

      const result = await this.wallet!.sendRosenBridgeData({
        receiver: params.lockAddress,
        amount: Number(unwrappedAmount),
        data: rosenDataHex,
      });

      if (!result.hash) {
        throw new Error('Transaction failed - no hash returned');
      }

      return result.hash;
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes('rejected') ||
          error.message.includes('denied') ||
          error.message.includes('cancelled')
        ) {
          throw new UserDeniedTransactionSignatureError(this.name);
        }
        if (
          error.message.includes('insufficient') ||
          error.message.includes('balance')
        ) {
          throw new Error('Insufficient balance for transaction');
        }
        throw new SubmitTransactionError(this.name, error.message);
      }
      throw new SubmitTransactionError(this.name, 'Unknown error occurred');
    }
  };
}
