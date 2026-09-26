import type { RosenChainToken } from '@rosen-bridge/tokens';
import type { ErgoBoxProxy, ErgoTxProxy, UnsignedErgoTxProxy } from '@rosen-network/ergo';
import { ErgoNetwork } from '@rosen-network/ergo/dist/client';
import { NETWORKS } from '@rosen-ui/constants';
import type { Network } from '@rosen-ui/types';
import { Wallet, type WalletTransferParams } from '@rosen-ui/wallet-api';

import { ergo } from '@/networks/ergo/client';
import { getTokenMap } from '@/tokenMap/getClientTokenMap';

import { requestDevnetSession } from './requestDevnetSession';

const icon =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect x="3" y="3" width="42" height="42" rx="8" fill="#ffae00"/><path d="M12 24h24M24 12v24" stroke="#202129" stroke-width="4"/></svg>';
const endpoint = process.env.NEXT_PUBLIC_ERGO_DEVNET_COMPANION_URL;

type Account = {
  network: 'devnet';
  address: string;
  enabled: boolean;
  lockAddress: string;
  targetAddress: string;
  tokenId: string;
};

class ErgoDevnetWallet extends Wallet {
  icon = icon;
  name = 'Local Ergo devnet';
  label = 'Local Ergo devnet';
  link = '';
  currentChain: Network = NETWORKS.ergo.key;
  supportedChains: Network[] = [NETWORKS.ergo.key];
  private session?: string;
  private account?: Account;

  isAvailable = () =>
    typeof window !== 'undefined' &&
    process.env.NODE_ENV === 'development' &&
    process.env.NEXT_PUBLIC_ZCASH_NETWORK === 'regtest' &&
    ['localhost', '127.0.0.1'].includes(window.location.hostname) &&
    /^http:\/\/127\.0\.0\.1:[0-9]+$/.test(endpoint ?? '');

  private request = async <T>(route: string, body?: unknown): Promise<T> => {
    if (!this.isAvailable() || !this.session)
      throw new Error('Local Ergo devnet session unavailable');
    const response = await fetch(`${endpoint}${route}`, {
      method: body === undefined ? 'GET' : 'POST',
      headers: { 'x-rosen-session': this.session, 'content-type': 'application/json' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      cache: 'no-store',
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? `Local signer HTTP ${response.status}`);
    return result as T;
  };

  performConnect = async () => {
    const code = await requestDevnetSession();
    if (!code || !/^[0-9a-f]{48}$/.test(code))
      throw new Error('A valid local companion session code is required');
    this.session = code;
    try {
      const account = await this.request<Account>('/account');
      if (account.network !== 'devnet') throw new Error('Local Ergo network differs from devnet');
      this.account = account;
    } catch (error) {
      this.session = undefined;
      throw error;
    }
  };

  performDisconnect = async () => {
    this.session = undefined;
    this.account = undefined;
  };
  hasConnection = async () => !!this.session && !!this.account;
  fetchAddress = async () => this.account?.address;
  fetchBalance = async (token: RosenChainToken) =>
    await this.request<string>(
      `/balance?token=${encodeURIComponent(token.tokenId === 'erg' ? 'ERG' : token.tokenId)}`,
    );

  performTransfer = async (params: WalletTransferParams): Promise<string> => {
    if (
      !(this.currentNetwork instanceof ErgoNetwork) ||
      !this.account?.enabled ||
      params.fromChain !== NETWORKS.ergo.key ||
      params.toChain !== NETWORKS.zcash.key ||
      params.lockAddress !== this.account.lockAddress ||
      params.address !== this.account.targetAddress ||
      params.token.tokenId !== this.account.tokenId
    ) {
      throw new Error('Transfer differs from the authorized Ergo devnet return');
    }
    const inputs = await this.request<ErgoBoxProxy[]>('/utxos');
    const unsigned: UnsignedErgoTxProxy = await this.currentNetwork.generateUnsignedTx(
      this.account.address,
      inputs,
      params.lockAddress,
      params.toChain,
      params.address,
      params.amount,
      params.bridgeFee.toString(),
      params.networkFee.toString(),
      params.token,
    );
    const signed = await this.request<ErgoTxProxy>('/sign', unsigned);
    return await this.request<string>('/submit', { id: signed.id });
  };
}

export const ergoDevnetWallet = new ErgoDevnetWallet({ networks: [ergo], getTokenMap });
