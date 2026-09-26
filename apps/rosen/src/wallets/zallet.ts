import type { RosenChainToken } from '@rosen-bridge/tokens';
import { NETWORKS } from '@rosen-ui/constants';
import type { Network } from '@rosen-ui/types';
import { UnsupportedChainError, Wallet, type WalletTransferParams } from '@rosen-ui/wallet-api';

import { ZcashNetwork, zcash } from '@/networks/zcash/client';
import { getTokenMap } from '@/tokenMap/getClientTokenMap';

const icon =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#F4B728"/><path d="M14 15h20L14 33h20M29 11v6M19 31v6" fill="none" stroke="#202129" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const companionUrl = process.env.NEXT_PUBLIC_ZALLET_COMPANION_URL;

type CompanionAccount = {
  network: 'regtest' | 'testnet' | 'mainnet';
  genesisHash: string;
  reserveAddress: string;
  accountId: string | number;
  transparentAddress: string;
  spendableZat: string;
  minimumConfirmations: 1;
};

const getCompanionEndpoint = () => {
  if (!companionUrl) return;
  try {
    const url = new URL(companionUrl);
    if (
      url.protocol !== 'http:' ||
      url.hostname !== '127.0.0.1' ||
      url.username ||
      url.password ||
      url.pathname !== '/' ||
      url.search ||
      url.hash
    )
      return;
    return url.toString().replace(/\/$/, '');
  } catch {
    return;
  }
};

/** A file handoff to a local Zallet companion. The browser never receives wallet keys or RPC credentials. */
export class ZalletWallet extends Wallet {
  icon = icon;
  name = 'Zallet file';
  label = 'Zallet file';
  link = 'https://github.com/zcash/zallet';
  currentChain: Network = NETWORKS.zcash.key;
  supportedChains: Network[] = [NETWORKS.zcash.key];
  private endpoint?: string;
  private sessionToken?: string;
  private account?: CompanionAccount;

  private getAccount = async (): Promise<CompanionAccount> => {
    if (!this.endpoint || !this.sessionToken)
      throw new Error('Local Zallet companion is not connected');
    const response = await fetch(`${this.endpoint}/v1/account`, {
      headers: { authorization: `Bearer ${this.sessionToken}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok)
      throw new Error(`Local Zallet companion rejected the connection (${response.status})`);
    const value: unknown = await response.json();
    if (!value || typeof value !== 'object')
      throw new Error('Local Zallet companion returned invalid account data');
    const account = value as Partial<CompanionAccount>;
    if (
      !['regtest', 'testnet', 'mainnet'].includes(account.network ?? '') ||
      typeof account.genesisHash !== 'string' ||
      !/^[0-9a-f]{64}$/.test(account.genesisHash) ||
      typeof account.reserveAddress !== 'string' ||
      (typeof account.accountId !== 'string' && !Number.isSafeInteger(account.accountId)) ||
      typeof account.transparentAddress !== 'string' ||
      !/^t[1-9A-HJ-NP-Za-km-z]{30,}$/.test(account.transparentAddress) ||
      typeof account.spendableZat !== 'string' ||
      !/^(0|[1-9][0-9]*)$/.test(account.spendableZat) ||
      account.minimumConfirmations !== 1
    ) {
      throw new Error('Local Zallet companion returned invalid account data');
    }
    if (!(this.currentNetwork instanceof ZcashNetwork))
      throw new Error('Zcash network is not selected');
    if (
      account.network !== this.currentNetwork.network ||
      account.genesisHash !== this.currentNetwork.genesisHash ||
      account.reserveAddress !== this.currentNetwork.lockAddress
    ) {
      throw new Error('Local Zallet companion network or reserve differs from Rosen Bridge');
    }
    this.account = account as CompanionAccount;
    return this.account;
  };

  performConnect = async () => {
    const endpoint = getCompanionEndpoint();
    if (!endpoint) throw new Error('A loopback Zallet companion URL is required');
    // biome-ignore lint/suspicious/noAlert: The local companion displays the one-time session token.
    const token = window.prompt('Enter the session token displayed by the local Zallet companion');
    if (!token || !/^[0-9a-f]{64}$/.test(token))
      throw new Error('A valid local Zallet companion session token is required');
    this.endpoint = endpoint;
    this.sessionToken = token;
    try {
      await this.getAccount();
    } catch (error) {
      this.endpoint = undefined;
      this.sessionToken = undefined;
      this.account = undefined;
      throw error;
    }
  };

  performDisconnect = async () => {
    this.endpoint = undefined;
    this.sessionToken = undefined;
    this.account = undefined;
  };

  hasConnection = async () => {
    if (!this.endpoint || !this.sessionToken) return false;
    try {
      await this.getAccount();
      return true;
    } catch {
      await this.performDisconnect();
      return false;
    }
  };
  isAvailable = () => typeof window !== 'undefined' && zcash.isDepositAvailable();
  fetchAddress = async () => (await this.getAccount()).transparentAddress;
  fetchBalance = async (token: RosenChainToken) => {
    if (token.tokenId !== 'zec' || token.decimals !== 8)
      throw new Error('Only native transparent ZEC is supported');
    return BigInt((await this.getAccount()).spendableZat);
  };

  performTransfer = async (params: WalletTransferParams): Promise<string> => {
    await this.getAccount();
    if (!(this.currentNetwork instanceof ZcashNetwork) || params.toChain !== NETWORKS.ergo.key) {
      throw new UnsupportedChainError(this.name, this.currentChain);
    }
    if (
      !['regtest', 'testnet', 'mainnet'].includes(this.currentNetwork.network ?? '') ||
      !this.currentNetwork.isConfigured() ||
      params.lockAddress !== this.currentNetwork.lockAddress
    ) {
      throw new Error('Zcash network or active reserve is not configured');
    }
    if (params.token.tokenId !== 'zec' || params.token.decimals !== 8) {
      throw new Error('Only native transparent ZEC is supported');
    }

    const tokenMap = await getTokenMap();
    const amountZat = tokenMap.unwrapAmount(
      params.token.tokenId,
      params.amount,
      NETWORKS.zcash.key,
    ).amount;
    if (
      amountZat <= 0n ||
      params.bridgeFee < 0n ||
      params.networkFee < 0n ||
      amountZat <= params.bridgeFee + params.networkFee
    ) {
      throw new Error('Invalid Zcash lock amount or Rosen fees');
    }
    const rosenDataHex = await this.currentNetwork.generateOpReturnData(
      params.toChain,
      params.address,
      params.networkFee.toString(),
      params.bridgeFee.toString(),
    );
    if (!/^00[0-9a-f]{32}21(?:02|03)[0-9a-f]{64}$/.test(rosenDataHex)) {
      throw new Error('The Zcash lock needs exactly 51 bytes of Ergo Rosen data');
    }

    const now = Date.now();
    const intent = {
      type: 'rosen-zcash-lock-intent',
      version: 1,
      requestId: crypto.randomUUID(),
      source: {
        chain: NETWORKS.zcash.key,
        network: this.currentNetwork.network,
        genesisHash: this.currentNetwork.genesisHash,
      },
      reserveAddress: params.lockAddress,
      amountZat: amountZat.toString(),
      target: { chain: NETWORKS.ergo.key, address: params.address },
      fees: { bridgeFee: params.bridgeFee.toString(), networkFee: params.networkFee.toString() },
      rosenDataHex,
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + 10 * 60_000).toISOString(),
    };
    return `file-intent:${JSON.stringify(intent)}`;
  };
}

export const zalletWallet = new ZalletWallet({ networks: [zcash], getTokenMap });
