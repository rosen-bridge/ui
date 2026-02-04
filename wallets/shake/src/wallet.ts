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

/**
 * Shake Wallet integration for Handshake
 *
 * This wallet integrates with the Shake Wallet to enable seamless
 * Handshake transactions for Rosen Bridge. Shake Wallet must be
 * installed and unlocked for this wallet to function.
 */
export class ShakeWallet extends Wallet<ShakeWalletConfig> {
  icon = ICON;

  name = 'Shake Wallet';

  label = 'Shake Wallet';

  link = 'https://ipfs.hnsproxy.au/shakewallet/';

  currentChain: Network = NETWORKS.handshake.key;

  supportedChains: Network[] = [NETWORKS.handshake.key];

  private wallet: ShakeWalletAPI | null = null;

  /**
   * Connect to Shake Wallet
   */
  performConnect = async (): Promise<void> => {
    if (!window.shake) {
      throw new Error(
        'Shake Wallet not found. Please install Shake Wallet from the Chrome Web Store.',
      );
    }

    try {
      this.wallet = await window.shake.connect();

      // Verify we can get an address (confirms wallet is properly connected)
      const address = await this.wallet.getAddress();
      if (!address) {
        throw new Error('Unable to get wallet address from Shake Wallet');
      }

      console.log('Connected to Shake Wallet, address:', address);
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

  /**
   * Disconnect from Shake Wallet
   */
  performDisconnect = async (): Promise<void> => {
    this.wallet = null;
    // Shake Wallet doesn't require explicit disconnect
  };

  /**
   * Get wallet address
   */
  fetchAddress = async (): Promise<string | undefined> => {
    if (!this.wallet) {
      return undefined;
    }

    try {
      return await this.wallet.getAddress();
    } catch (error) {
      console.error('Failed to fetch address from Shake Wallet:', error);
      return undefined;
    }
  };

  /**
   * Get wallet balance
   */
  fetchBalance = async (): Promise<string> => {
    if (!this.wallet) {
      return '0';
    }

    try {
      const balance = await this.wallet.getBalance();

      return balance.confirmed.toString();
    } catch (error) {
      console.error('Failed to fetch balance from Shake Wallet:', error);
      return '0';
    }
  };

  /**
   * Check if Shake Wallet is available
   */
  isAvailable = (): boolean => {
    return !!window.shake;
  };

  /**
   * Check if wallet has active connection
   */
  hasConnection = async (): Promise<boolean> => {
    try {
      return this.wallet !== null && !!(await this.fetchAddress());
    } catch {
      return false;
    }
  };

  /**
   * Create and submit a Rosen Bridge lock transaction via Shake Wallet.
   *
   * Uses the data-encoding approach (Bitcoin Runes method):
   * 1. Encodes Rosen metadata as hex
   * 2. Sends to wallet (wallet splits into 20-byte chunks)
   * 3. Each chunk becomes a P2WPKH address (data in address hash)
   * 4. Outputs ordered by value for extraction
   */
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
      // Generate Rosen Bridge metadata encoded as hex
      const rosenDataHex = await this.currentNetwork.generateOpReturnData(
        params.toChain,
        params.address,
        params.networkFee.toString(),
        params.bridgeFee.toString(),
      );

      console.log('Generated Rosen data:', rosenDataHex);
      console.log('Data length:', rosenDataHex.length / 2, 'bytes');

      // Send transaction with data-encoded outputs (wallet will chunk the data)
      const result = await this.wallet.sendRosenBridgeData({
        receiver: params.lockAddress,
        amount: Number(params.amount),
        data: rosenDataHex,
      });

      if (!result.hash) {
        throw new Error('Transaction failed - no hash returned');
      }

      console.log('Rosen Bridge transaction sent successfully:', result.hash);
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

  /**
   * Sign a message using the wallet
   */
  signMessage = async (message: string): Promise<string> => {
    if (!this.wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      const address = await this.wallet.getAddress();
      return await this.wallet.sign(address, message);
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes('rejected') || error.message.includes('denied'))
      ) {
        throw new UserDeniedTransactionSignatureError(this.name);
      }
      throw error;
    }
  };

  /**
   * Verify a message signature
   */
  verifyMessage = async (
    message: string,
    signature: string,
    address: string,
  ): Promise<boolean> => {
    if (!this.wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      return await this.wallet.verify(message, signature, address);
    } catch (error) {
      console.error('Failed to verify message:', error);
      return false;
    }
  };

  /**
   * Get wallet info for debugging
   */
  getWalletInfo = async (): Promise<unknown> => {
    if (!this.wallet) {
      return null;
    }

    try {
      const [address, balance] = await Promise.all([
        this.wallet.getAddress(),
        this.wallet.getBalance(),
      ]);

      return {
        address,
        balance,
        connected: true,
      };
    } catch (error) {
      console.error('Failed to get wallet info:', error);
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };
}
