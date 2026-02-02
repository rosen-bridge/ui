/**
 * Shake Wallet types
 */
import { WalletConfig } from '@rosen-ui/wallet-api';

export type ShakeWalletConfig = WalletConfig & {
  lockScriptHex: string;
  lockedNames: string[];
  publicNodeUrl: string;
};

export interface ShakeWallet {
  getAddress(): Promise<string>;
  getBalance(): Promise<{
    confirmed: number;
    unconfirmed: number;
    total: number;
  }>;
  send(address: string, amount: number): Promise<{ hash: string }>;

  sign(address: string, message: string): Promise<string>;
  signWithName(name: string, message: string): Promise<string>;
  verify(message: string, signature: string, address: string): Promise<boolean>;
  verifyWithName(
    message: string,
    signature: string,
    name: string,
  ): Promise<boolean>;

  // Name operations
  sendOpen(name: string): Promise<{ hash: string }>;
  sendBid(
    name: string,
    amount: number,
    lockup: number,
  ): Promise<{ hash: string }>;
  sendReveal(name: string): Promise<{ hash: string }>;
  sendRedeem(name: string): Promise<{ hash: string }>;
  sendUpdate(
    name: string,
    records: UpdateRecordType[],
  ): Promise<{ hash: string }>;
  sendRosenBridgeLock(
    opts: {
    name: string;
    lockScriptHex: string;
    resourceHex: string;
    recipientAddress?: string;
    recipientAmount?: number;
    rate?: number;
  },
  ): Promise<{ hash: string }>;

  // Info functions
  getNames(): Promise<unknown[]>;
  getBidsByName(name: string): Promise<unknown[]>;
  getPending(): Promise<unknown[]>;
  hashName(name: string): Promise<string>;
}

// Shake API that's accessible via window.shake
export interface ShakeAPI {
  connect(): Promise<ShakeWallet>;
  isLocked(): Promise<boolean>;
}

export interface UpdateRecordType {
  type: 'DS' | 'NS' | 'GLUE4' | 'GLUE6' | 'SYNTH4' | 'SYNTH6' | 'TXT';
  [key: string]: unknown;
}

// Global declarations for Shake extension
declare global {
  interface Window {
    shake?: ShakeAPI;
  }
}
