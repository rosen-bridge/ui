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

  performConnect = async (): Promise<void> => {
    if (!window.shake) {
      throw new Error(
        'Shake Wallet not found. Please install Shake Wallet from the Chrome Web Store.',
      );
    }

    if (await this.isConnected()) return;

    try {
      this.wallet = await window.shake.connect();

      const address = await this.wallet.getAddress();
      if (!address) {
        throw new Error('Unable to get wallet address from Shake Wallet');
      }
    } catch (error) {
      this.wallet = null;
      if (error instanceof Error) {
        if (
          error.message.includes('rejected') ||
          error.message.includes('denied')
        ) {
          throw new UserDeniedTransactionSignatureError(this.name);
        }
        throw new Error(`Failed to connect to Shake Wallet: ${error.message}`);
      }
      throw new Error('Failed to connect to Shake Wallet: Unknown error');
    }
  };

  performDisconnect = async (): Promise<void> => {
    this.wallet = null;
  };

  fetchAddress = async (): Promise<string | undefined> => {
    if (!this.wallet) {
      return undefined;
    }

    return await this.wallet.getAddress();
  };

  fetchBalance = async (): Promise<string> => {
    if (!this.wallet) {
      return '0';
    }

    const balance = await this.wallet.getBalance();

    return balance.confirmed.toString();
  };

  isAvailable = (): boolean => {
    return !!window.shake;
  };

  hasConnection = async (): Promise<boolean> => {
    try {
      return this.wallet !== null && !!(await this.fetchAddress());
    } catch {
      return false;
    }
  };

  performTransfer = async (params: WalletTransferParams): Promise<string> => {
    if (
      !this.currentNetwork ||
      !(this.currentNetwork instanceof HandshakeNetwork)
    ) {
      throw new UnsupportedChainError(this.name, this.currentChain);
    }

    if (!this.wallet) {
      throw new Error(
        'Wallet not connected. Please connect to Shake Wallet first.',
      );
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

      const result = await this.wallet.sendRosenBridgeData({
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
