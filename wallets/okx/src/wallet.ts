import { Okx as OKXIcon } from '@rosen-bridge/icons';
import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';
import {
  DisconnectionFailedError,
  AddressRetrievalError,
  ConnectionRejectedError,
  UserDeniedTransactionSignatureError,
  Wallet,
  WalletTransferParams,
} from '@rosen-ui/wallet-api';

import { OKXWalletConfig } from './types';

export class OKXWallet extends Wallet<OKXWalletConfig> {
  icon = OKXIcon;

  name = 'OKX';

  label = 'OKX';

  link = 'https://www.okx.com/';

  currentChain: Network = NETWORKS.bitcoin.key;

  supportedChains: Network[] = [NETWORKS.bitcoin.key];

  constructor(config: OKXWalletConfig) {
    super(config);
    this.tryReconnectToWallet();
  }

  private get api() {
    return window.okxwallet.bitcoin;
  }

  connect = async (): Promise<void> => {
    this.requireAvailable();
    try {
      console.log('[OKX] Attempting connection...');
      await this.api.connect();
      localStorage.setItem('okxwallet_connected', 'true');
      console.log('[OKX] Connection successful (saved to localStorage)');
    } catch (error) {
      console.error('[OKX] Connection failed:', error);
      throw new ConnectionRejectedError(this.name, error);
    }
  };

  disconnect = async (): Promise<void> => {
    this.requireAvailable();
    try {
      console.log('[OKX] Attempting disconnection...');
      await this.api.disconnect();
      localStorage.removeItem('okxwallet_connected');
      console.log('[OKX] Disconnected (localStorage cleared)');
    } catch (error) {
      console.error('[OKX] Disconnection failed:', error);
      throw new DisconnectionFailedError(this.name, error);
    }
  };

  getAddress = async (): Promise<string> => {
    this.requireAvailable();
    const accounts = await this.api.getAccounts();

    const account = accounts?.at(0);

    if (!account) throw new AddressRetrievalError(this.name);

    return account;
  };

  getBalanceRaw = async (): Promise<number> => {
    return (await this.api.getBalance()).confirmed;
  };

  isAvailable = (): boolean => {
    return (
      typeof window.okxwallet !== 'undefined' && !!window.okxwallet.bitcoin
    );
  };

  isConnected = async (): Promise<boolean> => {
    if (!this.isAvailable()) {
      console.log('[OKX] Wallet not installed');
      return false;
    }

    const localStorageState =
      localStorage.getItem('okxwallet_connected') === 'true';
    console.log(`[OKX] localStorage connection state: ${localStorageState}`);

    if (!localStorageState) return false;

    try {
      const accounts = await this.api.getAccounts();
      const walletState = accounts?.length > 0;
      console.log(`[OKX] Wallet extension reports connected: ${walletState}`);

      if (!walletState) {
        console.log('[OKX] ! State mismatch - clearing localStorage');
        localStorage.removeItem('okxwallet_connected');
        return false;
      }

      return true;
    } catch (err) {
      console.error('[OKX] Connection check error:', err);
      return false;
    }
  };

  private tryReconnectToWallet = async () => {
    const wasConnected = localStorage.getItem('okxwallet_connected') === 'true';
    if (!wasConnected) return;

    console.log('[OKX] Previously connected. Verifying...');
    const isStillConnected = await this.isConnected();

    if (isStillConnected) {
      console.log('[OKX] Reconnection successful');
    } else {
      console.log('[OKX] Reconnection failed. Removing flag.');
      localStorage.removeItem('okxwallet_connected');
    }
  };

  transfer = async (params: WalletTransferParams): Promise<string> => {
    this.requireAvailable();
    const userAddress = await this.getAddress();

    const opReturnData = await this.config.generateOpReturnData(
      params.toChain,
      params.address,
      params.networkFee.toString(),
      params.bridgeFee.toString(),
    );

    const psbtData = await this.config.generateUnsignedTx(
      params.lockAddress,
      userAddress,
      params.amount,
      opReturnData,
      params.token,
    );

    let signedPsbtHex;

    try {
      signedPsbtHex = await this.api.signPsbt(psbtData.psbt.hex, {
        autoFinalized: false,
        toSignInputs: Array.from(Array(psbtData.inputSize).keys()).map(
          (index) => ({
            address: userAddress,
            index: index,
          }),
        ),
      });
    } catch (error) {
      throw new UserDeniedTransactionSignatureError(this.name, error);
    }

    const txId = await this.config.submitTransaction(signedPsbtHex, 'hex');

    return txId;
  };
}
