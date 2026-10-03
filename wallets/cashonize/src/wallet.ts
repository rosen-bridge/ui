import { type RosenChainToken, TokenMap } from '@rosen-bridge/tokens';
import { generateBitcoinCashUnsignedLock } from '@rosen-network/bitcoin-cash';
import { BitcoinCashNetwork } from '@rosen-network/bitcoin-cash/client';
import { NETWORKS } from '@rosen-ui/constants';
import type { Network } from '@rosen-ui/types';
import {
  UnsupportedChainError,
  Wallet,
  type WalletConfig,
  type WalletTransferParams,
} from '@rosen-ui/wallet-api';

import type { CashonizeSession } from './session.js';

/** Session lifecycle supplied by the pinned SDK factory when the user connects. */
export type CashonizeWalletSession = Pick<
  CashonizeSession,
  'connect' | 'disconnect' | 'getAddress' | 'sign' | 'dispose'
>;

/** Explicit UI configuration; relay initialization is lazy and contains no BCH provider secrets. */
export interface CashonizeWalletConfig extends WalletConfig {
  createSession(): Promise<CashonizeWalletSession>;
}

/** Reject unknown TokenMap fallback and unsupported assets before balance or transfer conversion. */
const nativeMapping = (map: TokenMap, token: RosenChainToken): void => {
  const mapped = map.getTokenSet('bch')?.['bitcoin-cash'];
  if (
    token.type !== 'native' ||
    token.tokenId !== 'bch' ||
    token.decimals !== 8 ||
    mapped?.type !== 'native' ||
    mapped.tokenId !== 'bch' ||
    mapped.decimals !== 8
  )
    throw new Error('Cashonize requires a mapped eight-decimal native BCH asset');
};

/** Preserve token identity across awaited mapping lookups without retaining caller-owned objects. */
const snapshotToken = (token: RosenChainToken): RosenChainToken =>
  Object.freeze({
    tokenId: token.tokenId,
    name: token.name,
    decimals: token.decimals,
    type: token.type,
    residency: token.residency,
    extra: Object.freeze({ ...token.extra }),
  });

/** Preserve all deposit intent primitives before the common wallet connection checks can await. */
const snapshotTransfer = (params: WalletTransferParams): WalletTransferParams =>
  Object.freeze({
    token: snapshotToken(params.token),
    amount: params.amount,
    fromChain: params.fromChain,
    toChain: params.toChain,
    address: params.address,
    bridgeFee: params.bridgeFee,
    networkFee: params.networkFee,
    lockAddress: params.lockAddress,
  });

/** Copy the bounded conversion set before a provider await can observe an OCTM update. */
const snapshotConversion = async (shared: TokenMap): Promise<TokenMap> => {
  const mapping = shared.getTokenSet('bch');
  if (!mapping) throw new Error('Cashonize native conversion unavailable');
  const entries = Object.entries(mapping);
  if (entries.length < 1 || entries.length > 64)
    throw new Error('Cashonize native conversion unavailable');
  const copied: Record<string, RosenChainToken> = {};
  for (const [chain, value] of entries) {
    if (
      !/^[a-z][a-z0-9-]{0,63}$/.test(chain) ||
      !Number.isSafeInteger(value.decimals) ||
      value.decimals < 0 ||
      value.decimals > 255 ||
      [value.tokenId, value.name, value.type, value.residency].some(
        (field) => typeof field !== 'string' || field.length > 1024,
      )
    )
      throw new Error('Cashonize native conversion unavailable');
    copied[chain] = {
      tokenId: value.tokenId,
      name: value.name,
      type: value.type,
      residency: value.residency,
      decimals: value.decimals,
      extra: {},
    };
  }
  const privateMap = new TokenMap();
  await privateMap.updateConfigByJson([copied]);
  return privateMap;
};

/** Native Cashonize adapter for Rosen's wallet lifecycle and wrapped-amount contract. */
export class CashonizeWallet extends Wallet<CashonizeWalletConfig> {
  icon =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#0ac18e"/><path d="M8 6h5a3 3 0 0 1 0 6H8m0 0h5a3 3 0 0 1 0 6H8V6m2-2v16m3-16v2m0 12v2" fill="none" stroke="white" stroke-width="1.5"/></svg>';
  name = 'Cashonize';
  label = 'Cashonize';
  link = 'https://cashonize.com/';
  currentChain: Network = 'bitcoin-cash';
  supportedChains: Network[] = ['bitcoin-cash'];
  private session?: CashonizeWalletSession;
  private connecting = false;
  private generation = 0;
  private transferAbort?: AbortController;

  /** Require an assigned BCH network backed by complete server actions before offering connection. */
  isAvailable = (): boolean =>
    NETWORKS['bitcoin-cash'].index >= 0 &&
    this.currentNetwork instanceof BitcoinCashNetwork &&
    typeof this.config.createSession === 'function';

  /** Initialize and approve a real session lazily, rejecting concurrent connection attempts. */
  performConnect = async (): Promise<void> => {
    this.requireAvailable();
    if (this.connecting) throw new Error('Cashonize connection is already pending');
    this.connecting = true;
    let pending: CashonizeWalletSession | undefined;
    try {
      await this.performDisconnect();
      const generation = this.generation;
      pending = await this.config.createSession();
      if (generation !== this.generation) throw new Error('Cashonize connection cancelled');
      this.session = pending;
      await pending.connect();
      if (generation !== this.generation || this.session !== pending)
        throw new Error('Cashonize connection cancelled');
    } catch {
      if (this.session === pending) this.session = undefined;
      pending?.dispose();
      throw new Error('Cashonize connection failed');
    } finally {
      this.connecting = false;
    }
  };

  /** Clear local authorization before closing the relay session. */
  performDisconnect = async (): Promise<void> => {
    this.generation += 1;
    this.transferAbort?.abort();
    this.transferAbort = undefined;
    const previous = this.session;
    this.session = undefined;
    if (!previous) return;
    try {
      await previous.disconnect();
    } finally {
      previous.dispose();
    }
  };

  /** Return only a currently authorized address; stale SDK sessions fail through the session port. */
  fetchAddress = async (): Promise<string | undefined> => this.session?.getAddress();

  /** Check current session authorization without starting a relay request. */
  hasConnection = async (): Promise<boolean> => {
    try {
      return !!this.session?.getAddress();
    } catch {
      return false;
    }
  };

  /** Read raw satoshis only for explicitly mapped native BCH. */
  fetchBalance = async (token: RosenChainToken): Promise<bigint> => {
    const original = snapshotToken(token);
    nativeMapping(await this.config.getTokenMap(), original);
    const network = this.currentNetwork;
    if (!(network instanceof BitcoinCashNetwork)) throw new Error('Cashonize network unavailable');
    return network.getAddressBalance(await this.getAddress());
  };

  /** Convert a raw authenticated balance with one consistent validated TokenMap snapshot. */
  getBalance = async (token: RosenChainToken): Promise<bigint> => {
    const original = snapshotToken(token);
    this.requireAvailable();
    await this.requireConnection();
    const map = await snapshotConversion(await this.config.getTokenMap());
    nativeMapping(map, original);
    const network = this.currentNetwork;
    if (!(network instanceof BitcoinCashNetwork)) throw new Error('Cashonize network unavailable');
    const raw = await network.getAddressBalance(await this.getAddress());
    return map.wrapAmount('bch', raw, this.currentChain).amount;
  };

  /** Snapshot before inherited wallet gates await, then preserve their availability/connection/chain contract. */
  transfer = async (params: WalletTransferParams): Promise<string> => {
    const original = snapshotTransfer(params);
    this.requireAvailable();
    await this.requireConnection();
    if (this.currentNetwork?.name !== this.currentChain)
      throw new UnsupportedChainError(this.name, this.currentChain);
    return this.performTransfer(original);
  };

  /** Unwrap only the deposit amount; preserve Rosen fee units, verify signatures, then submit via the server. */
  performTransfer = async (params: WalletTransferParams): Promise<string> => {
    const original = snapshotTransfer(params);
    this.requireAvailable();
    await this.requireConnection();
    const network = this.currentNetwork;
    const session = this.session;
    if (
      !(network instanceof BitcoinCashNetwork) ||
      !session ||
      original.fromChain !== this.currentChain ||
      original.lockAddress !== network.lockAddress
    )
      throw new Error('Cashonize deposit network mismatch');
    if (this.transferAbort) throw new Error('Cashonize transfer is already pending');
    const controller = new AbortController();
    this.transferAbort = controller;
    try {
      const map = await this.config.getTokenMap();
      nativeMapping(map, original.token);
      if (typeof original.amount !== 'bigint' || original.amount <= 0n)
        throw new Error('Invalid Cashonize wrapped deposit amount');
      const amount = map.unwrapAmount('bch', original.amount, this.currentChain).amount;
      const metadata = {
        toChain: original.toChain,
        toAddress: original.address,
        bridgeFee: original.bridgeFee,
        networkFee: original.networkFee,
      };
      const source = session.getAddress();
      const parameters = await network.generateSigningParameters({
        fromAddress: source,
        amount,
        ...metadata,
      });
      if (this.session !== session || session.getAddress() !== source)
        throw new Error('Cashonize session changed before signing');
      const intent = generateBitcoinCashUnsignedLock(parameters);
      const signed = await session.sign(parameters, controller.signal);
      if (this.session !== session || session.getAddress() !== source)
        throw new Error('Cashonize session changed during signing');
      return await network.submitTransaction(
        signed.signedTransactionHex,
        intent,
        metadata,
        controller.signal,
      );
    } finally {
      if (this.transferAbort === controller) this.transferAbort = undefined;
    }
  };
}
