import type { RosenChainToken } from '@rosen-bridge/tokens';
import { FiroNetwork } from '@rosen-network/firo/dist/client';
import { NETWORKS } from '@rosen-ui/constants';
import type { Network } from '@rosen-ui/types';
import { getDecimalString } from '@rosen-ui/utils';
import {
  UnsupportedChainError,
  Wallet,
  type WalletTransferParams,
} from '@rosen-ui/wallet-api';

import { ICON } from './icon';
import type { FiroWalletConfig } from './types';

export class FiroWallet extends Wallet<FiroWalletConfig> {
  icon = ICON;

  name = 'Firo';

  label = 'Firo';

  link = 'https://firo.org/';

  currentChain: Network = NETWORKS.firo.key;

  supportedChains: Network[] = [NETWORKS.firo.key];

  performConnect = async (): Promise<void> => {};

  performDisconnect = async (): Promise<void> => {};

  fetchAddress = async (): Promise<string | undefined> => {
    return 'N/A';
  };

  fetchBalance = async (token: RosenChainToken): Promise<number> => {
    return 10 ** token.decimals * -1;
  };

  isAvailable = (): boolean => {
    return true;
  };

  hasConnection = async (): Promise<boolean> => {
    return true;
  };

  performTransfer = async (params: WalletTransferParams): Promise<string> => {
    if (!(this.currentNetwork instanceof FiroNetwork)) {
      throw new UnsupportedChainError(this.name, this.currentChain);
    }

    const opReturnData = await this.currentNetwork.generateOpReturnData(
      params.toChain,
      params.address,
      params.networkFee.toString(),
      params.bridgeFee.toString(),
    );

    const uri = await this.currentNetwork.buildPaymentUri(
      this.currentNetwork.lockAddress,
      getDecimalString(params.amount, params.token.decimals),
      opReturnData,
    );

    return `qrcode:${uri}`;
  };
}
