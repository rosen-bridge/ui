/**
 * Bob Extension wallet types
 */
import { WalletConfig } from '@rosen-ui/wallet-api';

export type BobExtensionConfig = WalletConfig & {
  // No specific config needed - Bob Extension auto-detects
};

export interface Bob3API {
  connect(): Promise<Bob3Wallet>;
  isLocked(): Promise<boolean>;
}

export interface Bob3Wallet {
  getAddress(): Promise<string>;
  getBalance(): Promise<{
    confirmed: number;
    unconfirmed: number;
    total: number;
  }>;
  send(address: string, amount: number): Promise<{ hash: string }>;

  // Advanced transaction building
  createTx(options: CreateTxOptions): Promise<{ hex: string }>;
  sendTx(hex: string): Promise<{ hash: string }>;

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
  sendCustomTx(
    outputs: unknown[],
    rate?: number,
    subtractFee?: boolean,
  ): Promise<{ hash: string }>;

  // Info functions
  getNames(): Promise<unknown[]>;
  getBidsByName(name: string): Promise<unknown[]>;
  getPending(): Promise<unknown[]>;
  hashName(name: string): Promise<string>;
}

export interface CreateTxOptions {
  outputs: TxOutput[];
  rate?: number;
  subtractFee?: boolean;
}

export interface TxOutput {
  address?: string;
  value: number;
  data?: string; // For OP_RETURN data
}

// Bob3 API that's accessible via window.bob3
export interface Bob3API {
  connect(): Promise<Bob3Wallet>;
  isLocked(): Promise<boolean>;
}

export interface UpdateRecordType {
  type: 'DS' | 'NS' | 'GLUE4' | 'GLUE6' | 'SYNTH4' | 'SYNTH6' | 'TXT';
  [key: string]: unknown;
}

// Global declarations for Bob3 extension
declare global {
  interface Window {
    bob3?: Bob3API;
  }
}
