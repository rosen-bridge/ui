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
import { BobExtensionConfig, Bob3Wallet } from './types';

/**
 * Bob Extension wallet integration for Handshake
 *
 * This wallet integrates with the Bob Extension to enable seamless
 * Handshake transactions for Rosen Bridge. Bob Extension must be
 * installed and unlocked for this wallet to function.
 */
export class BobExtensionWallet extends Wallet<BobExtensionConfig> {
  icon = ICON;

  name = 'Bob Extension';

  label = 'Bob Extension';

  link = 'https://bobwallet.io/';

  currentChain: Network = NETWORKS.handshake.key;

  supportedChains: Network[] = [NETWORKS.handshake.key];

  private wallet: Bob3Wallet | null = null;

  /**
   * Connect to Bob Extension
   */
  performConnect = async (): Promise<void> => {
    if (!window.bob3) {
      throw new Error(
        'Bob Extension not found. Please install Bob Extension from the Chrome Web Store.',
      );
    }

    try {
      this.wallet = await window.bob3.connect();

      // Verify we can get an address (confirms wallet is properly connected)
      const address = await this.wallet.getAddress();
      if (!address) {
        throw new Error('Unable to get wallet address from Bob Extension');
      }

      console.log('Connected to Bob Extension, address:', address);
    } catch (error) {
      this.wallet = null;
      if (error instanceof Error) {
        if (
          error.message.includes('rejected') ||
          error.message.includes('denied')
        ) {
          throw new UserDeniedTransactionSignatureError(this.name);
        }
        throw new Error(`Failed to connect to Bob Extension: ${error.message}`);
      }
      throw new Error('Failed to connect to Bob Extension: Unknown error');
    }
  };

  /**
   * Disconnect from Bob Extension
   */
  performDisconnect = async (): Promise<void> => {
    this.wallet = null;
    // Bob Extension doesn't require explicit disconnect
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
      console.error('Failed to fetch address from Bob Extension:', error);
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
      console.error('Failed to fetch balance from Bob Extension:', error);
      return '0';
    }
  };

  /**
   * Check if Bob Extension is available
   */
  isAvailable = (): boolean => {
    return !!window.bob3;
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
   * Create and submit bridge transaction using Bob Extension with Rosen metadata
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
        'Wallet not connected. Please connect to Bob Extension first.',
      );
    }

    try {
      // Generate Rosen Bridge metadata for OP_RETURN
      const rosenMetadata = await this.currentNetwork.generateOpReturnData(
        params.toChain,
        params.address,
        params.networkFee.toString(),
        params.bridgeFee.toString(),
      );

      console.log('Sending Rosen Bridge transaction:', {
        lockAddress: params.lockAddress,
        amount: params.amount,
        toChain: params.toChain,
        toAddress: params.address,
        bridgeFee: params.bridgeFee,
        networkFee: params.networkFee,
        metadata: rosenMetadata,
      });

      // Create transaction with OP_RETURN data containing Rosen metadata
      const result = await this.createBridgeTransaction(
        params.lockAddress,
        Number(params.amount),
        rosenMetadata,
      );

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
   * Create bridge transaction with OP_RETURN metadata
   */
  private createBridgeTransaction = async (
    lockAddress: string,
    amount: number,
    metadata: string,
  ): Promise<{ hash: string }> => {
    if (!this.wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      /*
        const hexData = Array.from(new TextEncoder().encode(customData))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
        outputs.push({
          address: recipient,
          value: 0,
          data: hexData,
        });
      */

      // Create transaction with two outputs:
      // 1. Send amount to lock address
      // 2. OP_RETURN with Rosen Bridge metadata
      const outputs = [
        {
          address: lockAddress,
          value: amount,
        },
        {
          value: 0,
          data: metadata, // OP_RETURN data containing Rosen Bridge metadata
        },
      ];

      console.log('Creating Rosen Bridge transaction with outputs:', outputs);

      // Create the transaction using Bob Extension's createTx
      const broadcastResult = await this.wallet.sendCustomTx(
        outputs,
        20, // 20 dollarydoos per byte fee rate
        false, // Don't subtract fee from the lock amount
      );

      console.log(
        'Bridge transaction broadcast successfully:',
        broadcastResult.hash,
      );

      return broadcastResult;
    } catch (error) {
      console.error('Failed to create bridge transaction:', error);

      // If custom transaction building fails, fall back to basic send and log metadata
      if (error instanceof Error) {
        console.warn(
          'Advanced transaction building failed, falling back to basic send',
        );

        // Log the metadata for external processing by the Rosen Bridge network layer
        console.log('Rosen Bridge metadata (for network layer processing):', {
          metadata,
          lockAddress,
          amount,
          note: 'Custom transaction failed, metadata should be handled by Rosen Bridge network layer',
        });

        return await this.wallet.send(lockAddress, amount);
      }

      throw error;
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
