import { FiroNetwork } from '@rosen-network/firo/dist/client';
import { buildPaymentUri } from '@rosen-network/firo';
import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';
import {
  UnsupportedChainError,
  Wallet,
  WalletTransferParams,
} from '@rosen-ui/wallet-api';
import { RosenChainToken } from '@rosen-bridge/tokens';

import { ICON } from './icon';
import { FiroWalletConfig } from './types';

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

    const uri = buildPaymentUri(
      this.currentNetwork.lockAddress,
      params.amount.toString(),
      opReturnData,
    );

    return 'qrcode:' + uri;
  };
}
