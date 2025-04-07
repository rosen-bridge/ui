import { Okx as OKXIcon } from '@rosen-bridge/icons';
import { RosenChainToken } from '@rosen-bridge/tokens';
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

import { WalletConfig, ChainConfig } from './types';

export class OKXWallet implements Wallet {
  icon = OKXIcon;

  name = 'OKX';

  label = 'OKX';

  link = 'https://www.okx.com/';

  supportedChains: Network[] = [NETWORKS.bitcoin.key, NETWORKS.doge.key];

  private get api() {
    // Use the appropriate API based on the current chain
    if (this.currentChain === NETWORKS.doge.key && window.okxwallet.doge) {
      return window.okxwallet.doge;
    }
    return window.okxwallet.bitcoin;
  }

  private currentChain: Network = NETWORKS.bitcoin.key;

  constructor(private config: WalletConfig) {}

  /**
   * Get the chain configuration for the current chain
   * @throws Error if the configuration doesn't exist
   */
  private getCurrentChainConfig(): ChainConfig {
    const chainConfig = this.config[this.currentChain];
    if (!chainConfig) {
      throw new Error(`Chain configuration for ${this.currentChain} not found`);
    }
    return chainConfig;
  }

  async connect(): Promise<void> {
    try {
      await this.api.connect();
    } catch (error) {
      throw new ConnectionRejectedError(this.name, error);
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.api.disconnect();
    } catch (error) {
      throw new DisconnectionFailedError(this.name, error);
    }
  }

  async getAddress(): Promise<string> {
    const accounts = await this.api.getAccounts();

    const account = accounts?.at(0);

    if (!account) throw new AddressRetrievalError(this.name);

    return account;
  }

  async getBalance(token: RosenChainToken): Promise<bigint> {
    const amount = await this.api.getBalance();

    if (!amount.confirmed) return 0n;

    const chainConfig = this.getCurrentChainConfig();
    const tokenMap = await chainConfig.getTokenMap();

    const wrappedAmount = tokenMap.wrapAmount(
      token.tokenId,
      BigInt(amount.confirmed),
      this.currentChain,
    ).amount;

    return wrappedAmount;
  }

  isAvailable(): boolean {
    return (
      typeof window.okxwallet !== 'undefined' &&
      (!!window.okxwallet.bitcoin || !!window.okxwallet.doge)
    );
  }

  async isConnected(): Promise<boolean> {
    return !!window.okxwallet.selectedAddress;
  }

  async switchChain(chain: Network, silent: boolean = false): Promise<void> {
    if (!this.supportedChains.includes(chain)) {
      if (!silent) {
        throw new Error(`Chain ${chain} is not supported by ${this.name}`);
      }
      return;
    }

    // Check if the chain configuration exists
    if (!this.config[chain]) {
      if (!silent) {
        throw new Error(`Chain configuration for ${chain} not found`);
      }
      return;
    }

    // Check if the wallet supports the selected chain
    if (chain === NETWORKS.doge.key && !window.okxwallet.doge) {
      if (!silent) {
        throw new Error(`OKX wallet does not support Dogecoin`);
      }
      return;
    }

    if (chain === NETWORKS.bitcoin.key && !window.okxwallet.bitcoin) {
      if (!silent) {
        throw new Error(`OKX wallet does not support Bitcoin`);
      }
      return;
    }

    this.currentChain = chain;
    // OKX wallet's bitcoin interface handles both Bitcoin and Dogecoin
    // No actual chain switching is needed as the API remains the same
    // but we track which chain is selected for other operations
  }

  async transfer(params: WalletTransferParams): Promise<string> {
    const userAddress = await this.getAddress();

    const chainConfig = this.getCurrentChainConfig();
    const opReturnData = await chainConfig.generateOpReturnData(
      params.toChain,
      params.address,
      params.networkFee.toString(),
      params.bridgeFee.toString(),
    );

    const psbtData = await chainConfig.generateUnsignedTx(
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

    const txId = await chainConfig.submitTransaction(signedPsbtHex, 'hex');

    return txId;
  }
}
